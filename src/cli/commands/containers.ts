import inquirer from 'inquirer';
import ora from 'ora';
import { DockerClient } from '../../core/docker/client.js';
import { renderContainerList, renderContainerStats } from '../../ui/components/ContainerList.js';
import { logger } from '../../utils/logger.js';

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
        { name: '📋 View Logs', value: 'logs' },
        { name: '💻 Execute Shell', value: 'exec' },
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
