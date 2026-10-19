import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { LoggerFormat } from '@volontariapp/config';
import { AppConfigService } from '../../../config/app-config.service.js';
import type { CustomConfig } from '../../../config/base-config.js';

describe('AppConfigService', () => {
  it('should expose db, logger, port, auth, and microServices getters correctly', () => {
    const rawConfig: Partial<CustomConfig> = {
      port: 3007,
      logger: {
        level: 'info',
        format: LoggerFormat.TEXT,
      },
      db: {
        host: 'localhost',
        port: 5438,
        username: 'user',
        password: 'password',
        database: 'ms_ranking',
        maxPoolSize: 10,
        ssl: false,
      },
      auth: {
        internalPublicKeyPath: 'certs/internal.pub',
      },
      microServices: {
        msUserUrl: 'localhost:5001',
        msPostUrl: 'localhost:5002',
        msEventUrl: 'localhost:5003',
        msSocialUrl: 'localhost:5004',
        msWsUrl: 'localhost:5005',
        msRankingUrl: '0.0.0.0:5007',
      },
    };

    const service = new AppConfigService(rawConfig as CustomConfig);

    expect(service.port).toBe(3007);
    expect(service.loggerLevel).toBe('info');
    expect(service.loggerFormat).toBe('text');
    expect(service.db.host).toBe('localhost');
    expect(service.db.database).toBe('ms_ranking');
    expect(service.auth.internalPublicKeyPath).toBe('certs/internal.pub');
    expect(service.microServices.msUserUrl).toBe('localhost:5001');
  });
});
