import inquirer from 'inquirer';
import ora from 'ora';
import { DockerClient } from '../../core/docker/client.js';
import { renderImageList } from '../../ui/components/ImageList.js';
import { logger } from '../../utils/logger.js';

export async function imagesCommand() {
  const client = new DockerClient();
  
  const spinner = ora('Loading images...').start();
  const images = await client.listImages();
  spinner.stop();

  if (images.length === 0) {
    logger.info('No images found');
    return;
  }

  console.log('\n🖼️  Images\n');
  console.log(renderImageList(images));
  console.log(`\n${images.length} images\n`);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '⬇️  Pull Image', value: 'pull' },
        { name: '🗑️  Remove Image', value: 'remove' },
        { name: '← Back', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') return;

  try {
    switch (action) {
      case 'pull':
        const { imageName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'imageName',
            message: 'Image name (e.g., nginx:latest):',
            validate: (input) => input.length > 0 || 'Image name is required'
          }
        ]);

        const pullSpinner = ora(`Pulling ${imageName}...`).start();
        await client.pullImage(imageName, (progress) => {
          pullSpinner.text = progress;
        });
        pullSpinner.succeed(`Image ${imageName} pulled successfully`);
        break;

      case 'remove':
        const { imageId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'imageId',
            message: 'Select image to remove:',
            choices: images.map(img => ({
              name: `${img.tags[0]} (${img.id})`,
              value: img.id
            }))
          }
        ]);

        const { confirmRemove } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmRemove',
            message: 'Are you sure you want to remove this image?',
            default: false
          }
        ]);

        if (confirmRemove) {
          const removeSpinner = ora('Removing image...').start();
          await client.removeImage(imageId, true);
          removeSpinner.succeed('Image removed successfully');
        }
        break;
    }
  } catch (error: any) {
    logger.error(`Failed: ${error.message}`);
  }
}
