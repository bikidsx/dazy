export interface Template {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  
  // Container config
  image: string;
  command?: string[];
  entrypoint?: string[];
  
  // Networking
  ports?: PortMapping[];
  networks?: string[];
  hostname?: string;
  
  // Storage
  volumes?: VolumeMapping[];
  tmpfs?: string[];
  
  // Environment
  environment?: Record<string, string>;
  env_file?: string[];
  
  // Resources
  memory?: string;
  cpus?: number;
  
  // Behavior
  restart?: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  healthcheck?: HealthCheck;
  depends_on?: string[];
  
  // Variables (for prompting)
  variables?: Variable[];
}

export interface Variable {
  name: string;
  description?: string;
  default?: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'password';
  validation?: string;
}

export interface PortMapping {
  host: number | string;
  container: number;
  protocol?: 'tcp' | 'udp';
}

export interface VolumeMapping {
  source: string;
  target: string;
  readonly?: boolean;
}

export interface HealthCheck {
  test: string[];
  interval?: string;
  timeout?: string;
  retries?: number;
  start_period?: string;
}

export interface TemplateRunOptions {
  name?: string;
  variables?: Record<string, string>;
  detach?: boolean;
}
