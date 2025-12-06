import { formatDistanceToNow } from 'date-fns';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatUptime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: false });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length - 3) + '...' : str;
}

export function formatPorts(ports: Array<{ PublicPort?: number; PrivatePort: number; Type: string }>): string {
  if (!ports || ports.length === 0) return '-';
  return ports
    .map(p => p.PublicPort ? `${p.PublicPort}→${p.PrivatePort}` : `${p.PrivatePort}`)
    .join(', ');
}
