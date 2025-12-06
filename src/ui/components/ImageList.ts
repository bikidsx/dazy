import Table from 'cli-table3';
import chalk from 'chalk';
import type { Image } from '../../types/docker.js';
import { formatBytes, formatUptime } from '../../utils/format.js';

export function renderImageList(images: Image[]): string {
  const table = new Table({
    head: [
      chalk.bold('IMAGE ID'),
      chalk.bold('REPOSITORY:TAG'),
      chalk.bold('SIZE'),
      chalk.bold('CREATED')
    ],
    colWidths: [15, 45, 15, 20]
  });

  images.forEach(img => {
    const tags = img.tags.join(', ');
    const displayTag = tags.length > 40 ? tags.substring(0, 37) + '...' : tags;
    
    table.push([
      chalk.yellow(img.id),
      chalk.cyan(displayTag),
      formatBytes(img.size),
      formatUptime(img.created)
    ]);
  });

  return table.toString();
}
