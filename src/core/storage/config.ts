import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export class ConfigManager {
  private configDir: string;
  private templatesDir: string;

  constructor() {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      this.configDir = join(homedir(), 'Library', 'Preferences', 'dazy');
    } else if (platform === 'win32') {
      this.configDir = join(process.env.APPDATA || homedir(), 'dazy');
    } else {
      this.configDir = join(homedir(), '.config', 'dazy');
    }

    this.templatesDir = join(this.configDir, 'templates');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
    }
    if (!existsSync(this.templatesDir)) {
      mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  getTemplatesDir(): string {
    return this.templatesDir;
  }

  getConfigDir(): string {
    return this.configDir;
  }

  readJSON<T>(filename: string): T | null {
    const filepath = join(this.configDir, filename);
    if (!existsSync(filepath)) return null;
    
    try {
      const content = readFileSync(filepath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  writeJSON(filename: string, data: any): void {
    const filepath = join(this.configDir, filename);
    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
