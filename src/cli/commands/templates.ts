import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { TemplateManager } from '../../core/templates/manager.js';
import { renderTemplateList, renderTemplateDetail } from '../../ui/components/TemplateList.js';
import { logger } from '../../utils/logger.js';
import type { Template } from '../../types/template.js';

export async function templatesCommand() {
  const manager = new TemplateManager();
  
  const spinner = ora('Loading templates...').start();
  const { custom, builtIn } = await manager.list();
  spinner.stop();

  console.clear();
  console.log(chalk.bold.cyan('\n🎯 Templates\n'));
  console.log(chalk.gray('─'.repeat(50)) + '\n');

  if (custom.length > 0) {
    console.log(renderTemplateList(custom, 'CUSTOM TEMPLATES'));
    console.log();
  }

  if (builtIn.length > 0) {
    console.log(renderTemplateList(builtIn, 'BUILT-IN TEMPLATES'));
    console.log();
  }

  if (custom.length === 0 && builtIn.length === 0) {
    logger.info('No templates found');
    return;
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '▶️  Run Template', value: 'run' },
        { name: '👁️  View Template', value: 'view' },
        { name: '💾 Save from Container', value: 'save' },
        { name: '📥 Import Template', value: 'import' },
        { name: '📤 Export Template', value: 'export' },
        { name: '🗑️  Delete Template', value: 'delete' },
        { name: '← Back', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') return;

  try {
    switch (action) {
      case 'run':
        await runTemplate(manager, [...custom, ...builtIn]);
        break;
      case 'view':
        await viewTemplate(manager, [...custom, ...builtIn]);
        break;
      case 'save':
        await saveFromContainer(manager);
        break;
      case 'import':
        await importTemplate(manager);
        break;
      case 'export':
        await exportTemplate(manager, [...custom, ...builtIn]);
        break;
      case 'delete':
        await deleteTemplate(manager, custom);
        break;
    }
  } catch (error: any) {
    logger.error(`Failed: ${error.message}`);
  }
}

async function runTemplate(manager: TemplateManager, templates: Template[]) {
  const { templateName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateName',
      message: 'Select template to run:',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description || t.image}`,
        value: t.name
      }))
    }
  ]);

  const template = await manager.get(templateName);
  if (!template) return;

  // Collect variables
  const variables: Record<string, string> = {};
  if (template.variables && template.variables.length > 0) {
    console.log(chalk.bold('\n📝 Template Variables:\n'));
    
    for (const variable of template.variables) {
      const { value } = await inquirer.prompt([
        {
          type: variable.type === 'password' ? 'password' : 'input',
          name: 'value',
          message: `${variable.name}${variable.required ? ' *' : ''}:`,
          default: variable.default,
          validate: (input) => {
            if (variable.required && !input) {
              return `${variable.name} is required`;
            }
            return true;
          }
        }
      ]);
      variables[variable.name] = value;
    }
  }

  const { containerName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'containerName',
      message: 'Container name:',
      default: template.name
    }
  ]);

  const runSpinner = ora(`Creating container from template...`).start();
  const containerId = await manager.run(templateName, {
    name: containerName,
    variables
  });
  runSpinner.succeed(`Container '${containerName}' created and started`);
  
  logger.info(`Container ID: ${containerId}`);
}

async function viewTemplate(manager: TemplateManager, templates: Template[]) {
  const { templateName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateName',
      message: 'Select template to view:',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description || t.image}`,
        value: t.name
      }))
    }
  ]);

  const template = await manager.get(templateName);
  if (!template) return;

  console.log(renderTemplateDetail(template));
}

async function saveFromContainer(manager: TemplateManager) {
  const { DockerClient } = await import('../../core/docker/client.js');
  const client = new DockerClient();
  
  const containers = await client.listContainers({ status: 'all' });
  
  if (containers.length === 0) {
    logger.warn('No containers found');
    return;
  }

  const { containerId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'containerId',
      message: 'Select container:',
      choices: containers.map(c => ({
        name: `${c.name} (${c.image})`,
        value: c.id
      }))
    }
  ]);

  const { templateName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'templateName',
      message: 'Template name:',
      validate: (input) => input.length > 0 || 'Template name is required'
    }
  ]);

  const spinner = ora('Saving template...').start();
  await manager.saveFromContainer(containerId, templateName);
  spinner.succeed(`Template '${templateName}' saved successfully`);
}

async function importTemplate(manager: TemplateManager) {
  const { filepath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filepath',
      message: 'Template file path:',
      validate: (input) => input.length > 0 || 'File path is required'
    }
  ]);

  const spinner = ora('Importing template...').start();
  const template = await manager.import(filepath);
  spinner.succeed(`Template '${template.name}' imported successfully`);
}

async function exportTemplate(manager: TemplateManager, templates: Template[]) {
  const { templateName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateName',
      message: 'Select template to export:',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description || t.image}`,
        value: t.name
      }))
    }
  ]);

  const { outputPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputPath',
      message: 'Output file path:',
      default: `./${templateName}.dazy.json`
    }
  ]);

  const spinner = ora('Exporting template...').start();
  await manager.export(templateName, outputPath);
  spinner.succeed(`Template exported to ${outputPath}`);
}

async function deleteTemplate(manager: TemplateManager, templates: Template[]) {
  if (templates.length === 0) {
    logger.warn('No custom templates to delete');
    return;
  }

  const { templateName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateName',
      message: 'Select template to delete:',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description || t.image}`,
        value: t.name
      }))
    }
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete '${templateName}'?`,
      default: false
    }
  ]);

  if (confirm) {
    const spinner = ora('Deleting template...').start();
    await manager.delete(templateName);
    spinner.succeed(`Template '${templateName}' deleted`);
  }
}
