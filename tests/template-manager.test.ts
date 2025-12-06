import { describe, test, expect } from 'bun:test';
import { TemplateManager } from '../src/core/templates/manager';

describe('TemplateManager', () => {
  test('should create manager instance', () => {
    const manager = new TemplateManager();
    expect(manager).toBeDefined();
  });

  test('should list templates', async () => {
    const manager = new TemplateManager();
    const { custom, builtIn } = await manager.list();
    
    expect(Array.isArray(custom)).toBe(true);
    expect(Array.isArray(builtIn)).toBe(true);
    expect(builtIn.length).toBeGreaterThan(0);
  });

  test('should get built-in template', async () => {
    const manager = new TemplateManager();
    const template = await manager.get('postgres');
    
    expect(template).toBeDefined();
    expect(template?.name).toBe('postgres');
    expect(template?.image).toContain('postgres');
  });
});
