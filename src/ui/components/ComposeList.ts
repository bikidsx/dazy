import Table from 'cli-table3';
import chalk from 'chalk';
import type { ComposeService } from '../../types/compose.js';

export function renderComposeServices(services: ComposeService[], projectName: string): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.cyan(`\n📄 ${projectName}`));
  lines.push(chalk.gray('─'.repeat(50)));
  lines.push(`\n${chalk.bold(`Services (${services.length}):`)}` + '\n');

  const table = new Table({
    head: [
      chalk.bold('STATUS'),
      chalk.bold('SERVICE'),
      chalk.bold('STATE'),
      chalk.bold('PORTS')
    ],
    colWidths: [10, 25, 15, 30]
  });

  services.forEach(s => {
    const statusIcon = s.state === 'running' ? chalk.green('▶️ ') : chalk.gray('⏸️ ');
    const ports = s.ports.join(', ') || '-';
    
    table.push([
      statusIcon,
      chalk.cyan(s.name),
      s.state,
      ports
    ]);
  });

  lines.push(table.toString());
  
  return lines.join('\n');
}
