import { describe, expect, it } from 'vitest';
import { BngFormatDurationPipe } from './format-duration.pipe';

describe('BngFormatDurationPipe', () => {
  const pipe = new BngFormatDurationPipe();

  it('should format minutes and seconds', () => {
    expect(pipe.transform('PT32M5S')).toBe('32:05');
  });

  it('should format with prefix', () => {
    expect(pipe.transform('PT4M12S', '+')).toBe('+4:12');
  });

  it('should format hours', () => {
    expect(pipe.transform('PT1H2M30S')).toBe('1:02:30');
  });

  it('should format zero minutes', () => {
    expect(pipe.transform('PT0M45S')).toBe('0:45');
  });

  it('should format seconds only', () => {
    expect(pipe.transform('PT5S')).toBe('0:05');
  });

  it('should format minutes only', () => {
    expect(pipe.transform('PT10M')).toBe('10:00');
  });

  it('should format hours with prefix', () => {
    expect(pipe.transform('PT1H2M30S', '+')).toBe('+1:02:30');
  });

  it('should return raw string for invalid input', () => {
    expect(pipe.transform('invalid')).toBe('invalid');
  });
});
