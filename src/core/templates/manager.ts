import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { Template, TemplateRunOptions } from '../../types/template.js';
import { ConfigManager } from '../storage/config.js';
import { DockerClient } from '../docker/client.js';
import { BUILT_IN_TEMPLATES } from './built-in.js';

export class TemplateManager {
  private config: ConfigManager;
  private docker: DockerClient;

  constructor() {
    this.config = new ConfigManager();
    this.docker = new DockerClient();
  }

  async list(): Promise<{ custom: Template[]; builtIn: Template[] }> {
    const custom = this.loadCustomTemplates();
    return { custom, builtIn: BUILT_IN_TEMPLATES };
  }

  private loadCustomTemplates(): Template[] {
    const templatesDir = this.config.getTemplatesDir();
    if (!existsSync(templatesDir)) return [];

    const files = readdirSync(templatesDir).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const content = readFileSync(join(templatesDir, file), 'utf-8');
      return JSON.parse(content) as Template;
    });
  }

  async get(name: string): Promise<Template | null> {
    // Check custom templates first
    const customPath = join(this.config.getTemplatesDir(), `${name}.json`);
    if (existsSync(customPath)) {
      const content = readFileSync(customPath, 'utf-8');
      return JSON.parse(content);
    }

    // Check built-in templates
    const builtIn = BUILT_IN_TEMPLATES.find(t => t.name === name);
    if (builtIn) return builtIn;

    return null;
  }

  async save(template: Template): Promise<void> {
    const filepath = join(this.config.getTemplatesDir(), `${template.name}.json`);
    writeFileSync(filepath, JSON.stringify(template, null, 2), 'utf-8');
  }

  async delete(name: string): Promise<boolean> {
    const filepath = join(this.config.getTemplatesDir(), `${name}.json`);
    if (!existsSync(filepath)) return false;

    const fs = await import('fs/promises');
    await fs.unlink(filepath);
    return true;
  }

  async run(templateName: string, options: TemplateRunOptions = {}): Promise<string> {
    const template = await this.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Substitute variables
    const resolvedTemplate = this.substituteVariables(template, options.variables || {});

    // Create container config
    const containerName = options.name || template.name;
    const config: any = {
      Image: resolvedTemplate.image,
      name: containerName,
      Hostname: resolvedTemplate.hostname,
      Cmd: resolvedTemplate.command,
      Entrypoint: resolvedTemplate.entrypoint,
      Env: this.buildEnvArray(resolvedTemplate.environment || {}),
      ExposedPorts: this.buildExposedPorts(resolvedTemplate.ports || []),
      HostConfig: {
        RestartPolicy: { Name: resolvedTemplate.restart || 'no' },
        PortBindings: this.buildPortBindings(resolvedTemplate.ports || []),
        Binds: this.buildBinds(resolvedTemplate.volumes || []),
      },
    };

    if (resolvedTemplate.healthcheck) {
      config.Healthcheck = {
        Test: resolvedTemplate.healthcheck.test,
        Interval: this.parseTime(resolvedTemplate.healthcheck.interval),
        Timeout: this.parseTime(resolvedTemplate.healthcheck.timeout),
        Retries: resolvedTemplate.healthcheck.retries,
      };
    }

    // Create volumes if needed
    for (const vol of resolvedTemplate.volumes || []) {
      if (!vol.source.startsWith('/') && !vol.source.startsWith('.')) {
        try {
          await this.docker.createVolume(vol.source);
        } catch {
          // Volume might already exist
        }
      }
    }

    // Create container
    const Docker = (await import('dockerode')).default;
    const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    const container = await docker.createContainer(config);

    // Start container
    await container.start();

    return container.id;
  }

  private substituteVariables(template: Template, variables: Record<string, string>): Template {
    const templateStr = JSON.stringify(template);
    let result = templateStr;

    // Replace ${VAR} with values
    const varPattern = /\$\{([^}]+)\}/g;
    result = result.replace(varPattern, (match, varName) => {
      return variables[varName] || match;
    });

    return JSON.parse(result);
  }

  private buildEnvArray(env: Record<string, string>): string[] {
    return Object.entries(env).map(([key, value]) => `${key}=${value}`);
  }

  private buildExposedPorts(ports: any[]): Record<string, {}> {
    const exposed: Record<string, {}> = {};
    ports.forEach(p => {
      exposed[`${p.container}/${p.protocol || 'tcp'}`] = {};
    });
    return exposed;
  }

  private buildPortBindings(ports: any[]): Record<string, any[]> {
    const bindings: Record<string, any[]> = {};
    ports.forEach(p => {
      const key = `${p.container}/${p.protocol || 'tcp'}`;
      bindings[key] = [{ HostPort: String(p.host) }];
    });
    return bindings;
  }

  private buildBinds(volumes: any[]): string[] {
    return volumes.map(v => {
      const mode = v.readonly ? 'ro' : 'rw';
      return `${v.source}:${v.target}:${mode}`;
    });
  }

  private parseTime(time?: string): number {
    if (!time) return 0;
    const match = time.match(/^(\d+)(s|m|h)$/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000000000;
      case 'm':
        return value * 60 * 1000000000;
      case 'h':
        return value * 3600 * 1000000000;
      default:
        return 0;
    }
  }

  async export(name: string, outputPath: string): Promise<void> {
    const template = await this.get(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }

    writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf-8');
  }

  async import(filepath: string): Promise<Template> {
    const content = readFileSync(filepath, 'utf-8');
    const template = JSON.parse(content) as Template;
    await this.save(template);
    return template;
  }

  async saveFromContainer(containerId: string, templateName: string): Promise<Template> {
    const Docker = (await import('dockerode')).default;
    const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    const container = docker.getContainer(containerId);
    const info = await container.inspect();

    const cmd = info.Config.Cmd;
    const entrypoint = info.Config.Entrypoint;

    const template: Template = {
      name: templateName,
      description: `Template created from container ${info.Name}`,
      image: info.Config.Image,
      command: Array.isArray(cmd) ? cmd : undefined,
      entrypoint: Array.isArray(entrypoint) ? entrypoint : undefined,
      environment: this.parseEnvArray(info.Config.Env || []),
      ports: this.parsePortBindings(info.HostConfig.PortBindings || {}),
      volumes: this.parseBinds(info.HostConfig.Binds || []),
      restart: this.parseRestartPolicy(info.HostConfig.RestartPolicy),
      hostname: info.Config.Hostname,
    };

    await this.save(template);
    return template;
  }

  private parseEnvArray(env: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    env.forEach(e => {
      const [key, ...valueParts] = e.split('=');
      result[key] = valueParts.join('=');
    });
    return result;
  }

  private parsePortBindings(bindings: any): any[] {
    const ports: any[] = [];
    Object.entries(bindings).forEach(([key, value]: [string, any]) => {
      const [container, protocol] = key.split('/');
      if (value && value[0]) {
        ports.push({
          host: parseInt(value[0].HostPort),
          container: parseInt(container),
          protocol: protocol || 'tcp',
        });
      }
    });
    return ports;
  }

  private parseBinds(binds: string[]): any[] {
    return binds.map(bind => {
      const parts = bind.split(':');
      return {
        source: parts[0],
        target: parts[1],
        readonly: parts[2] === 'ro',
      };
    });
  }

  private parseRestartPolicy(policy: any): Template['restart'] {
    if (!policy || !policy.Name) return 'no';
    return policy.Name as Template['restart'];
  }
}
