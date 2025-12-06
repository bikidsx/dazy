import Table from 'cli-table3';
import chalk from 'chalk';
import type { Volume } from '../../types/docker.js';

export function renderVolumeList(volumes: Volume[]): string {
  const table = new Table({
    head: [
      chalk.bold('NAME'),
      chalk.bold('DRIVER'),
      chalk.bold('MOUNTPOINT')
    ],
    colWidths: [30, 15, 60]
  });

  volumes.forEach(v => {
    table.push([
      chalk.cyan(v.name),
      v.driver,
      chalk.gray(v.mountpoint)
    ]);
  });

  return table.toString();
}
