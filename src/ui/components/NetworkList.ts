import Table from 'cli-table3';
import chalk from 'chalk';
import type { Network } from '../../types/docker.js';

export function renderNetworkList(networks: Network[]): string {
  const table = new Table({
    head: [
      chalk.bold('NETWORK ID'),
      chalk.bold('NAME'),
      chalk.bold('DRIVER'),
      chalk.bold('SCOPE')
    ],
    colWidths: [15, 25, 15, 15]
  });

  networks.forEach(n => {
    table.push([
      chalk.yellow(n.id),
      chalk.cyan(n.name),
      n.driver,
      n.scope
    ]);
  });

  return table.toString();
}
