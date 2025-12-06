import inquirer from 'inquirer';
import ora from 'ora';
import { DockerClient } from '../../core/docker/client.js';
import { renderVolumeList } from '../../ui/components/VolumeList.js';
import { logger } from '../../utils/logger.js';

export async function volumesCommand() {
  const client = new DockerClient();
  
  const spinner = ora('Loading volumes...').start();
  const volumes = await client.listVolumes();
  spinner.stop();

  if (volumes.length === 0) {
    logger.info('No volumes found');
    return;
  }

  console.log('\n💾 Volumes\n');
  console.log(renderVolumeList(volumes));
  console.log(`\n${volumes.length} volumes\n`);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Create Volume', value: 'create' },
        { name: '🗑️  Remove Volume', value: 'remove' },
        { name: '← Back', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') return;

  try {
    switch (action) {
      case 'create':
        const { volumeName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'volumeName',
            message: 'Volume name:',
            validate: (input) => input.length > 0 || 'Volume name is required'
          }
        ]);

        const createSpinner = ora(`Creating volume ${volumeName}...`).start();
        await client.createVolume(volumeName);
        createSpinner.succeed(`Volume ${volumeName} created`);
        break;

      case 'remove':
        const { volumeToRemove } = await inquirer.prompt([
          {
            type: 'list',
            name: 'volumeToRemove',
            message: 'Select volume to remove:',
            choices: volumes.map(v => ({
              name: v.name,
              value: v.name
            }))
          }
        ]);

        const { confirmRemove } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmRemove',
            message: `Are you sure you want to remove volume ${volumeToRemove}?`,
            default: false
          }
        ]);

        if (confirmRemove) {
          const removeSpinner = ora(`Removing volume ${volumeToRemove}...`).start();
          await client.removeVolume(volumeToRemove);
          removeSpinner.succeed(`Volume ${volumeToRemove} removed`);
        }
        break;
    }
  } catch (error: any) {
    logger.error(`Failed: ${error.message}`);
  }
}
