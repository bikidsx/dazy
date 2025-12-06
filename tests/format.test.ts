import { describe, test, expect } from 'bun:test';
import { formatBytes, formatPercentage, truncate } from '../src/utils/format';

describe('Format Utils', () => {
  test('formatBytes should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1048576)).toBe('1.00 MB');
    expect(formatBytes(1073741824)).toBe('1.00 GB');
  });

  test('formatPercentage should format percentage', () => {
    expect(formatPercentage(50.5)).toBe('50.5%');
    expect(formatPercentage(100)).toBe('100.0%');
    expect(formatPercentage(0.123)).toBe('0.1%');
  });

  test('truncate should truncate long strings', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('this is a very long string', 10)).toBe('this is...');
  });
});
