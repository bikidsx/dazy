#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { DockerClient } from '../core/docker/client.js';
import { containersCommand } from './commands/containers.js';
import { imagesCommand } from './commands/images.js';
import { volumesCommand } from './commands/volumes.js';
import { networksCommand } from './commands/networks.js';
import { templatesCommand } from './commands/templates.js';
import { composeCommand } from './commands/compose.js';
import { logger } from '../utils/logger.js';

const ASCII_LOGO = `
██████╗ ███████╗██████╗ ██╗   ██╗
██╔══██╗██╔════╝██╔══██╗██║   ██║
██║  ██║█████╗  ██████╔╝██║   ██║
██║  ██║██╔══╝  ██╔══██╗██║   ██║
██████╔╝███████╗██████╔╝╚██████╔╝
╚═════╝ ╚══════╝╚═════╝  ╚═════╝ 
`;

async function mainMenu() {
  console.clear();
  console.log(chalk.cyan(ASCII_LOGO));
  console.log(chalk.gray('🐳 Docker Manager v0.1.0'));
  console.log(chalk.gray('─'.repeat(50)) + '\n');

  // Check Docker connection
  const client = new DockerClient();
  const isConnected = await client.ping();
  
  if (!isConnected) {
    logger.error('Cannot connect to Docker daemon. Is Docker running?');
    process.exit(1);
  }

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: [
        { name: '📦 Containers', value: 'containers' },
        { name: '🖼️  Images', value: 'images' },
        { name: '💾 Volumes', value: 'volumes' },
        { name: '🌐 Networks', value: 'networks' },
        { name: '📄 Compose Projects', value: 'compose' },
        { name: '🎯 Templates', value: 'templates' },
        { name: '✕ Exit', value: 'exit' }
      ]
    }
  ]);

  switch (choice) {
    case 'containers':
      await containersCommand();
      break;
    case 'images':
      await imagesCommand();
      break;
    case 'volumes':
      await volumesCommand();
      break;
    case 'networks':
      await networksCommand();
      break;
    case 'compose':
      await composeCommand();
      break;
    case 'templates':
      await templatesCommand();
      break;
    case 'exit':
      console.log(chalk.gray('\nGoodbye! 👋\n'));
      process.exit(0);
  }

  // Return to main menu
  const { returnToMenu } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'returnToMenu',
      message: 'Return to main menu?',
      default: true
    }
  ]);

  if (returnToMenu) {
    await mainMenu();
  }
}

const program = new Command();

program
  .name('debu')
  .description('Developer-first terminal UI for Docker management')
  .version('0.1.0');

program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(mainMenu);

program
  .command('containers')
  .alias('c')
  .description('Manage containers')
  .action(containersCommand);

program
  .command('images')
  .alias('img')
  .description('Manage images')
  .action(imagesCommand);

program
  .command('volumes')
  .alias('v')
  .description('Manage volumes')
  .action(volumesCommand);

program
  .command('networks')
  .alias('n')
  .description('Manage networks')
  .action(networksCommand);

program
  .command('compose')
  .alias('comp')
  .description('Manage Docker Compose projects')
  .action(composeCommand);

program
  .command('templates')
  .alias('t')
  .description('Manage templates')
  .action(templatesCommand);

// Default to interactive mode if no command specified
if (process.argv.length === 2) {
  mainMenu();
} else {
  program.parse();
}
