import { describe, test, expect } from 'bun:test';
import { DockerClient } from '../src/core/docker/client';

describe('DockerClient', () => {
  test('should create client instance', () => {
    const client = new DockerClient();
    expect(client).toBeDefined();
  });

  test('should ping Docker daemon', async () => {
    const client = new DockerClient();
    const isConnected = await client.ping();
    expect(typeof isConnected).toBe('boolean');
  });
});
