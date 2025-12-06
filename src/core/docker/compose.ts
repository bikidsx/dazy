import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type { ComposeProject, ComposeService, ComposeOptions } from '../../types/compose.js';

export class ComposeManager {
  async detectComposeFiles(directory: string = process.cwd()): Promise<string[]> {
    const possibleFiles = [
      'docker-compose.yml',
      'docker-compose.yaml',
      'compose.yml',
      'compose.yaml'
    ];

    return possibleFiles
      .map(f => `${directory}/${f}`)
      .filter(f => existsSync(f));
  }

  async getProject(file: string): Promise<ComposeProject | null> {
    if (!existsSync(file)) return null;

    try {
      const content = readFileSync(file, 'utf-8');
      const compose = parseYaml(content);
      
      const projectName = this.getProjectName(file);
      const services = await this.getServices(file);

      return {
        name: projectName,
        file,
        services
      };
    } catch (error) {
      return null;
    }
  }

  private getProjectName(file: string): string {
    const dir = file.split('/').slice(0, -1).pop() || 'default';
    return dir;
  }

  async getServices(file: string): Promise<ComposeService[]> {
    try {
      const output = execSync(`docker compose -f ${file} ps --format json`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      if (!output.trim()) return [];

      const lines = output.trim().split('\n');
      return lines.map(line => {
        const service = JSON.parse(line);
        return {
          name: service.Service || service.Name,
          status: service.Status || 'unknown',
          state: service.State || 'unknown',
          ports: this.parsePorts(service.Publishers || [])
        };
      });
    } catch {
      // If compose ps fails, parse the file to get service names
      return this.getServicesFromFile(file);
    }
  }

  private getServicesFromFile(file: string): ComposeService[] {
    try {
      const content = readFileSync(file, 'utf-8');
      const compose = parseYaml(content);
      
      if (!compose.services) return [];

      return Object.keys(compose.services).map(name => ({
        name,
        status: 'Not running',
        state: 'exited',
        ports: []
      }));
    } catch {
      return [];
    }
  }

  private parsePorts(publishers: any[]): string[] {
    if (!Array.isArray(publishers)) return [];
    return publishers.map(p => {
      if (p.PublishedPort && p.TargetPort) {
        return `${p.PublishedPort}→${p.TargetPort}`;
      }
      return '';
    }).filter(Boolean);
  }

  async up(file: string, options: ComposeOptions = {}): Promise<void> {
    const args = ['compose', '-f', file, 'up'];
    
    if (options.detach !== false) args.push('-d');
    if (options.build) args.push('--build');
    if (options.removeOrphans) args.push('--remove-orphans');
    if (options.forceRecreate) args.push('--force-recreate');

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', args, { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`docker compose up failed with code ${code}`));
      });
    });
  }

  async down(file: string, options: { volumes?: boolean } = {}): Promise<void> {
    const args = ['compose', '-f', file, 'down'];
    if (options.volumes) args.push('-v');

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', args, { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`docker compose down failed with code ${code}`));
      });
    });
  }

  async restart(file: string, service?: string): Promise<void> {
    const args = ['compose', '-f', file, 'restart'];
    if (service) args.push(service);

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', args, { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`docker compose restart failed with code ${code}`));
      });
    });
  }

  async logs(file: string, service?: string, follow = false): Promise<void> {
    const args = ['compose', '-f', file, 'logs'];
    if (follow) args.push('-f');
    if (service) args.push(service);

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', args, { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`docker compose logs failed with code ${code}`));
      });
    });
  }

  async pull(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('docker', ['compose', '-f', file, 'pull'], { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`docker compose pull failed with code ${code}`));
      });
    });
  }

  async build(file: string, service?: string): Promise<void> {
    const args = ['compose', '-f', file, 'build'];
    if (service) args.push(service);

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', args, { stdio: 'inherit' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`docker compose build failed with code ${code}`));
      });
    });
  }

  validateFile(file: string): { valid: boolean; errors: string[] } {
    try {
      const content = readFileSync(file, 'utf-8');
      parseYaml(content);
      return { valid: true, errors: [] };
    } catch (error: any) {
      return { valid: false, errors: [error.message] };
    }
  }
}
