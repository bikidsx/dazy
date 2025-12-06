import Table from 'cli-table3';
import chalk from 'chalk';
import type { Template } from '../../types/template.js';

export function renderTemplateList(templates: Template[], title: string): string {
  if (templates.length === 0) return '';

  const table = new Table({
    head: [
      chalk.bold('NAME'),
      chalk.bold('DESCRIPTION'),
      chalk.bold('IMAGE'),
      chalk.bold('TAGS')
    ],
    colWidths: [20, 35, 30, 25]
  });

  templates.forEach(t => {
    const tags = t.tags?.join(', ') || '-';
    const desc = t.description || '-';
    
    table.push([
      chalk.cyan(t.name),
      desc.length > 32 ? desc.substring(0, 29) + '...' : desc,
      chalk.yellow(t.image),
      chalk.gray(tags.length > 22 ? tags.substring(0, 19) + '...' : tags)
    ]);
  });

  return `${chalk.bold(title)}\n${table.toString()}`;
}

export function renderTemplateDetail(template: Template): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.cyan(`\n📦 ${template.name}`));
  lines.push(chalk.gray('─'.repeat(50)));
  
  if (template.description) {
    lines.push(`\n${template.description}`);
  }
  
  lines.push(`\n${chalk.bold('Image:')} ${chalk.yellow(template.image)}`);
  
  if (template.ports && template.ports.length > 0) {
    lines.push(`\n${chalk.bold('Ports:')}`);
    template.ports.forEach(p => {
      lines.push(`  ${p.host} → ${p.container}/${p.protocol || 'tcp'}`);
    });
  }
  
  if (template.volumes && template.volumes.length > 0) {
    lines.push(`\n${chalk.bold('Volumes:')}`);
    template.volumes.forEach(v => {
      const mode = v.readonly ? '(ro)' : '(rw)';
      lines.push(`  ${v.source} → ${v.target} ${chalk.gray(mode)}`);
    });
  }
  
  if (template.environment && Object.keys(template.environment).length > 0) {
    lines.push(`\n${chalk.bold('Environment:')}`);
    Object.entries(template.environment).forEach(([key, value]) => {
      lines.push(`  ${key}=${value}`);
    });
  }
  
  if (template.variables && template.variables.length > 0) {
    lines.push(`\n${chalk.bold('Variables:')}`);
    template.variables.forEach(v => {
      const required = v.required ? chalk.red('*') : ' ';
      const defaultVal = v.default ? chalk.gray(` (default: ${v.default})`) : '';
      lines.push(`  ${required} ${v.name}${defaultVal}`);
      if (v.description) {
        lines.push(`    ${chalk.gray(v.description)}`);
      }
    });
  }
  
  lines.push(chalk.gray('\n' + '─'.repeat(50)));
  
  return lines.join('\n');
}
