import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { ComposeManager } from '../../core/docker/compose.js';
import { renderComposeServices } from '../../ui/components/ComposeList.js';
import { logger } from '../../utils/logger.js';

export async function composeCommand() {
  const manager = new ComposeManager();
  
  const spinner = ora('Detecting compose files...').start();
  const files = await manager.detectComposeFiles();
  spinner.stop();

  if (files.length === 0) {
    logger.warn('No docker-compose files found in current directory');
    return;
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: 'Select compose file:',
      choices: files.map(f => ({
        name: f.split('/').pop(),
        value: f
      }))
    }
  ]);

  const loadSpinner = ora('Loading project...').start();
  const project = await manager.getProject(selectedFile);
  loadSpinner.stop();

  if (!project) {
    logger.error('Failed to load compose project');
    return;
  }

  console.clear();
  console.log(renderComposeServices(project.services, project.name));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '⬆️  Up (Start all services)', value: 'up' },
        { name: '⬇️  Down (Stop all services)', value: 'down' },
        { name: '🔄 Restart', value: 'restart' },
        { name: '📋 Logs', value: 'logs' },
        { name: '⬇️  Pull Images', value: 'pull' },
        { name: '🔨 Build', value: 'build' },
        { name: '✅ Validate', value: 'validate' },
        { name: '← Back', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') return;

  try {
    switch (action) {
      case 'up':
        const { upOptions } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'upOptions',
            message: 'Options:',
            choices: [
              { name: 'Build images', value: 'build' },
              { name: 'Force recreate', value: 'forceRecreate' },
              { name: 'Remove orphans', value: 'removeOrphans' }
            ]
          }
        ]);

        const upSpinner = ora('Starting services...').start();
        await manager.up(selectedFile, {
          build: upOptions.includes('build'),
          forceRecreate: upOptions.includes('forceRecreate'),
          removeOrphans: upOptions.includes('removeOrphans')
        });
        upSpinner.succeed('Services started successfully');
        break;

      case 'down':
        const { removeVolumes } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'removeVolumes',
            message: 'Remove volumes?',
            default: false
          }
        ]);

        const downSpinner = ora('Stopping services...').start();
        await manager.down(selectedFile, { volumes: removeVolumes });
        downSpinner.succeed('Services stopped successfully');
        break;

      case 'restart':
        const { restartService } = await inquirer.prompt([
          {
            type: 'list',
            name: 'restartService',
            message: 'Restart:',
            choices: [
              { name: 'All services', value: null },
              ...project.services.map(s => ({
                name: s.name,
                value: s.name
              }))
            ]
          }
        ]);

        const restartSpinner = ora('Restarting...').start();
        await manager.restart(selectedFile, restartService);
        restartSpinner.succeed('Restarted successfully');
        break;

      case 'logs':
        const { logsService, follow } = await inquirer.prompt([
          {
            type: 'list',
            name: 'logsService',
            message: 'View logs for:',
            choices: [
              { name: 'All services', value: null },
              ...project.services.map(s => ({
                name: s.name,
                value: s.name
              }))
            ]
          },
          {
            type: 'confirm',
            name: 'follow',
            message: 'Follow logs?',
            default: false
          }
        ]);

        logger.info('Fetching logs...\n');
        await manager.logs(selectedFile, logsService, follow);
        break;

      case 'pull':
        const pullSpinner = ora('Pulling images...').start();
        await manager.pull(selectedFile);
        pullSpinner.succeed('Images pulled successfully');
        break;

      case 'build':
        const { buildService } = await inquirer.prompt([
          {
            type: 'list',
            name: 'buildService',
            message: 'Build:',
            choices: [
              { name: 'All services', value: null },
              ...project.services.map(s => ({
                name: s.name,
                value: s.name
              }))
            ]
          }
        ]);

        const buildSpinner = ora('Building...').start();
        await manager.build(selectedFile, buildService);
        buildSpinner.succeed('Build completed successfully');
        break;

      case 'validate':
        const validation = manager.validateFile(selectedFile);
        if (validation.valid) {
          logger.success('Compose file is valid');
        } else {
          logger.error('Compose file has errors:');
          validation.errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
        }
        break;
    }
  } catch (error: any) {
    logger.error(`Failed: ${error.message}`);
  }
}
