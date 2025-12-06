import inquirer from 'inquirer';
import ora from 'ora';
import { DockerClient } from '../../core/docker/client.js';
import { renderNetworkList } from '../../ui/components/NetworkList.js';
import { logger } from '../../utils/logger.js';

export async function networksCommand() {
  const client = new DockerClient();
  
  const spinner = ora('Loading networks...').start();
  const networks = await client.listNetworks();
  spinner.stop();

  if (networks.length === 0) {
    logger.info('No networks found');
    return;
  }

  console.log('\n🌐 Networks\n');
  console.log(renderNetworkList(networks));
  console.log(`\n${networks.length} networks\n`);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Create Network', value: 'create' },
        { name: '🗑️  Remove Network', value: 'remove' },
        { name: '← Back', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') return;

  try {
    switch (action) {
      case 'create':
        const { networkName, driver } = await inquirer.prompt([
          {
            type: 'input',
            name: 'networkName',
            message: 'Network name:',
            validate: (input) => input.length > 0 || 'Network name is required'
          },
          {
            type: 'list',
            name: 'driver',
            message: 'Driver:',
            choices: ['bridge', 'overlay', 'macvlan'],
            default: 'bridge'
          }
        ]);

        const createSpinner = ora(`Creating network ${networkName}...`).start();
        await client.createNetwork(networkName, driver);
        createSpinner.succeed(`Network ${networkName} created`);
        break;

      case 'remove':
        const systemNetworks = ['bridge', 'host', 'none'];
        const removableNetworks = networks.filter(n => !systemNetworks.includes(n.name));

        if (removableNetworks.length === 0) {
          logger.warn('No removable networks found (system networks cannot be removed)');
          return;
        }

        const { networkId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'networkId',
            message: 'Select network to remove:',
            choices: removableNetworks.map(n => ({
              name: `${n.name} (${n.driver})`,
              value: n.id
            }))
          }
        ]);

        const { confirmRemove } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmRemove',
            message: 'Are you sure you want to remove this network?',
            default: false
          }
        ]);

        if (confirmRemove) {
          const removeSpinner = ora('Removing network...').start();
          await client.removeNetwork(networkId);
          removeSpinner.succeed('Network removed successfully');
        }
        break;
    }
  } catch (error: any) {
    logger.error(`Failed: ${error.message}`);
  }
}
