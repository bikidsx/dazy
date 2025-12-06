import Table from 'cli-table3';
import chalk from 'chalk';
import type { Container } from '../../types/docker.js';
import { formatUptime, formatPorts } from '../../utils/format.js';

export function renderContainerList(containers: Container[]): string {
  const table = new Table({
    head: [
      chalk.bold('STATUS'),
      chalk.bold('NAME'),
      chalk.bold('IMAGE'),
      chalk.bold('UPTIME'),
      chalk.bold('PORTS')
    ],
    colWidths: [10, 25, 30, 15, 30]
  });

  containers.forEach(c => {
    const statusIcon = c.state === 'running' ? chalk.green('▶️ ') : chalk.gray('⏸️ ');
    const name = chalk.cyan(c.name);
    const uptime = c.state === 'running' ? formatUptime(c.created) : chalk.gray('Stopped');
    const ports = formatPorts(c.ports.map(p => ({
      PublicPort: p.host,
      PrivatePort: p.container,
      Type: p.protocol
    })));

    table.push([statusIcon, name, c.image, uptime, ports]);
  });

  return table.toString();
}

export function renderContainerStats(running: number, stopped: number): string {
  return chalk.gray(`${running + stopped} containers | ${running} running`);
}
