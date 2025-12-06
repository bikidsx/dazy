export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: number;
  ports: PortMapping[];
}

export interface PortMapping {
  host?: number;
  container: number;
  protocol: string;
}

export interface ContainerStats {
  cpu: number;
  memory: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}

export interface Image {
  id: string;
  tags: string[];
  size: number;
  created: number;
}

export interface Volume {
  name: string;
  driver: string;
  mountpoint: string;
  created: string;
}

export interface Network {
  id: string;
  name: string;
  driver: string;
  scope: string;
}

export interface ContainerFilters {
  status?: 'running' | 'stopped' | 'all';
  name?: string;
}

export interface LogOptions {
  follow?: boolean;
  tail?: number;
  timestamps?: boolean;
}
