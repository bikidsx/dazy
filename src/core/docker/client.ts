import Docker from 'dockerode';
import type { Container, Image, Volume, Network, ContainerFilters } from '../../types/docker.js';

export class DockerClient {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async listContainers(filters?: ContainerFilters): Promise<Container[]> {
    const all = !filters?.status || filters.status === 'all';
    const dockerFilters: any = {};
    
    if (filters?.status === 'running') {
      dockerFilters.status = ['running'];
    } else if (filters?.status === 'stopped') {
      dockerFilters.status = ['exited', 'created'];
    }

    const containers = await this.docker.listContainers({ all, filters: dockerFilters });
    
    return containers.map(c => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0]?.replace(/^\//, '') || 'unknown',
      image: c.Image,
      status: c.Status,
      state: c.State,
      created: c.Created,
      ports: c.Ports.map(p => ({
        host: p.PublicPort,
        container: p.PrivatePort,
        protocol: p.Type
      }))
    }));
  }

  async startContainer(id: string): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.start();
  }

  async stopContainer(id: string, timeout = 10): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.stop({ t: timeout });
  }

  async restartContainer(id: string): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.restart();
  }

  async removeContainer(id: string, force = false): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.remove({ force });
  }

  async getContainerLogs(id: string, tail = 100): Promise<string> {
    const container = this.docker.getContainer(id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true
    });
    return logs.toString('utf-8');
  }

  async execInContainer(id: string, shell = '/bin/sh'): Promise<void> {
    const container = this.docker.getContainer(id);
    const exec = await container.exec({
      Cmd: [shell],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true
    });
    
    const stream = await exec.start({ hijack: true, stdin: true });
    
    process.stdin.setRawMode(true);
    process.stdin.pipe(stream);
    stream.pipe(process.stdout);
    
    stream.on('end', () => {
      process.stdin.setRawMode(false);
      process.stdin.unpipe(stream);
    });
  }

  async listImages(): Promise<Image[]> {
    const images = await this.docker.listImages();
    
    return images.map(img => ({
      id: img.Id.replace('sha256:', '').substring(0, 12),
      tags: img.RepoTags || ['<none>'],
      size: img.Size,
      created: img.Created
    }));
  }

  async pullImage(name: string, onProgress?: (progress: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.pull(name, (err: any, stream: any) => {
        if (err) return reject(err);
        
        this.docker.modem.followProgress(stream, 
          (err: any) => err ? reject(err) : resolve(),
          (event: any) => {
            if (onProgress && event.status) {
              onProgress(`${event.status} ${event.progress || ''}`);
            }
          }
        );
      });
    });
  }

  async removeImage(id: string, force = false): Promise<void> {
    const image = this.docker.getImage(id);
    await image.remove({ force });
  }

  async listVolumes(): Promise<Volume[]> {
    const result = await this.docker.listVolumes();
    
    return (result.Volumes || []).map(v => ({
      name: v.Name,
      driver: v.Driver,
      mountpoint: v.Mountpoint,
      created: v.CreatedAt || 'unknown'
    }));
  }

  async createVolume(name: string): Promise<Volume> {
    const volume = await this.docker.createVolume({ Name: name });
    return {
      name: volume.Name,
      driver: volume.Driver,
      mountpoint: volume.Mountpoint,
      created: volume.CreatedAt || 'unknown'
    };
  }

  async removeVolume(name: string, force = false): Promise<void> {
    const volume = this.docker.getVolume(name);
    await volume.remove({ force });
  }

  async listNetworks(): Promise<Network[]> {
    const networks = await this.docker.listNetworks();
    
    return networks.map(n => ({
      id: n.Id.substring(0, 12),
      name: n.Name,
      driver: n.Driver,
      scope: n.Scope
    }));
  }

  async createNetwork(name: string, driver = 'bridge'): Promise<Network> {
    const network = await this.docker.createNetwork({ Name: name, Driver: driver });
    const info = await network.inspect();
    
    return {
      id: info.Id.substring(0, 12),
      name: info.Name,
      driver: info.Driver,
      scope: info.Scope
    };
  }

  async removeNetwork(id: string): Promise<void> {
    const network = this.docker.getNetwork(id);
    await network.remove();
  }

  async ping(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch {
      return false;
    }
  }
}
