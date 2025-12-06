import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { DockerClient } from '../../core/docker/client.js';
import { renderContainerList, renderContainerStats } from '../../ui/components/ContainerList.js';
import { logger } from '../../utils/logger.js';
import { formatBytes, formatPercentage } from '../../utils/format.js';

export async function containersCommand() {
  const client = new DockerClient();
  
  const spinner = ora('Loading containers...').start();
  const containers = await client.listContainers({ status: 'all' });
  spinner.stop();

  if (containers.length === 0) {
    logger.info('No containers found');
    return;
  }

  console.log('\n📦 Containers\n');
  console.log(renderContainerList(containers));
  
  const running = containers.filter(c => c.state === 'running').length;
  const stopped = containers.length - running;
  console.log('\n' + renderContainerStats(running, stopped) + '\n');

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📊 Live Stats', value: 'stats' },
        { name: '� Vxiew Logs', value: 'logs' },
        { name: '� RExecute Shell', value: 'exec' },
        { name: '🔄 Restart Container', value: 'restart' },
        { name: '⏸️  Stop Container', value: 'stop' },
        { name: '▶️  Start Container', value: 'start' },
        { name: '🗑️  Remove Container', value: 'remove' },
        { name: '← Back', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') return;

  const { containerId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'containerId',
      message: 'Select container:',
      choices: containers.map(c => ({
        name: `${c.state === 'running' ? '▶️' : '⏸️'} ${c.name} (${c.image})`,
        value: c.id
      }))
    }
  ]);

  const container = containers.find(c => c.id === containerId);
  if (!container) return;

  try {
    switch (action) {
      case 'stats':
        if (container.state !== 'running') {
          logger.warn('Container must be running to view stats');
          break;
        }
        await showLiveStats(containerId, container.name);
        break;

      case 'logs':
        const logSpinner = ora('Fetching logs...').start();
        const logs = await client.getContainerLogs(containerId);
        logSpinner.stop();
        console.log('\n' + logs);
        break;

      case 'exec':
        logger.info(`Opening shell in ${container.name}...`);
        await client.execInContainer(containerId);
        break;

      case 'restart':
        const restartSpinner = ora(`Restarting ${container.name}...`).start();
        await client.restartContainer(containerId);
        restartSpinner.succeed(`Container ${container.name} restarted`);
        break;

      case 'stop':
        const stopSpinner = ora(`Stopping ${container.name}...`).start();
        await client.stopContainer(containerId);
        stopSpinner.succeed(`Container ${container.name} stopped`);
        break;

      case 'start':
        const startSpinner = ora(`Starting ${container.name}...`).start();
        await client.startContainer(containerId);
        startSpinner.succeed(`Container ${container.name} started`);
        break;

      case 'remove':
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to remove ${container.name}?`,
            default: false
          }
        ]);
        
        if (confirm) {
          const removeSpinner = ora(`Removing ${container.name}...`).start();
          await client.removeContainer(containerId, true);
          removeSpinner.succeed(`Container ${container.name} removed`);
        }
        break;
    }
  } catch (error: any) {
    logger.error(`Failed: ${error.message}`);
  }
}

async function showLiveStats(containerId: string, containerName: string) {
  const Docker = (await import('dockerode')).default;
  const docker = new Docker({ socketPath: '/var/run/docker.sock' });
  const container = docker.getContainer(containerId);

  console.log(chalk.cyan(`\n📊 Live Stats - ${containerName}`));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  console.log(chalk.gray('─'.repeat(60)));

  const stream = await container.stats({ stream: true });

  stream.on('data', (data: Buffer) => {
    try {
      const stats = JSON.parse(data.toString());

      // Calculate CPU percentage
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuCount = stats.cpu_stats.online_cpus || 1;
      const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * cpuCount * 100 : 0;

      // Calculate memory
      const memUsage = stats.memory_stats.usage || 0;
      const memLimit = stats.memory_stats.limit || 1;
      const memPercent = (memUsage / memLimit) * 100;

      // Network I/O
      let netRx = 0;
      let netTx = 0;
      if (stats.networks) {
        Object.values(stats.networks).forEach((net: any) => {
          netRx += net.rx_bytes || 0;
          netTx += net.tx_bytes || 0;
        });
      }

      // Block I/O
      let blockRead = 0;
      let blockWrite = 0;
      if (stats.blkio_stats?.io_service_bytes_recursive) {
        stats.blkio_stats.io_service_bytes_recursive.forEach((io: any) => {
          if (io.op === 'read' || io.op === 'Read') blockRead += io.value;
          if (io.op === 'write' || io.op === 'Write') blockWrite += io.value;
        });
      }

      // Clear line and print stats
      process.stdout.write('\x1B[2K\x1B[1A'.repeat(6));
      console.log(`${chalk.bold('CPU:')}     ${formatPercentage(cpuPercent).padEnd(10)} ${renderBar(cpuPercent, 30)}`);
      console.log(`${chalk.bold('Memory:')}  ${formatBytes(memUsage).padEnd(10)} / ${formatBytes(memLimit)} (${formatPercentage(memPercent)})`);
      console.log(`${chalk.bold('Net RX:')}  ${formatBytes(netRx)}`);
      console.log(`${chalk.bold('Net TX:')}  ${formatBytes(netTx)}`);
      console.log(`${chalk.bold('Disk R:')}  ${formatBytes(blockRead)}`);
      console.log(`${chalk.bold('Disk W:')}  ${formatBytes(blockWrite)}`);
    } catch {
      // Ignore parse errors
    }
  });

  // Handle Ctrl+C
  await new Promise<void>(resolve => {
    process.on('SIGINT', () => {
      (stream as any).destroy?.();
      console.log(chalk.gray('\n\nStats stopped.'));
      resolve();
    });
  });
}

function renderBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `[${bar}]`;
}
