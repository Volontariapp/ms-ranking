import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { loadConfig } from '@volontariapp/config';
import { CustomConfig } from '../../../config/base-config.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

describe('LoadConfig Integration Test', () => {
  it('should load default.config.json for ms-ranking correctly', () => {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const repositoryRootDir = join(currentDir, '../../../..');
    const configDir = join(repositoryRootDir, 'config');

    const config = loadConfig(configDir, CustomConfig);

    expect(config).toBeDefined();
    expect(typeof config.port).toBe('number');
    expect(config.db.database).toBe('ms_ranking');
    expect(config.db.port).toBe(5438);
    expect(config.auth.internalPublicKeyPath).toBe('certs/internal.pub');
    expect(config.microServices.msUserUrl).toBe('localhost:5001');
  });
});
