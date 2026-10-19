import './tracing.js';
import 'reflect-metadata';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { loadConfig } from '@volontariapp/config';
import { CustomConfig } from './config/base-config.js';
import { Logger } from '@volontariapp/logger';

function resolveConfigDirectory(): string {
  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const repositoryRootDir = join(currentFileDir, '..');
  const rootConfigDir = join(repositoryRootDir, 'config');
  if (existsSync(rootConfigDir)) {
    return rootConfigDir;
  }

  throw new Error(`Config directory not found: ${rootConfigDir}`);
}

async function bootstrap() {
  const appConfig = loadConfig(resolveConfigDirectory(), CustomConfig);
  Logger.setDefaultConfig({ format: appConfig.logger.format });
  const logger = new Logger({
    context: 'MS-RANKING',
    format: appConfig.logger.format,
  });
  const app = await NestFactory.create(AppModule.register(appConfig), {
    logger,
  });

  // The gRPC server (connectMicroservice with GRPC_MICROSERVICES.RANKING) is added once
  // the ranking contracts are published (ticket 3.2).

  const config = new DocumentBuilder()
    .setTitle('Ranking Service')
    .setDescription('The Ranking Service API description')
    .setVersion('1.0')
    .addTag('ranking')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableShutdownHooks();

  await app.listen(appConfig.port);
  logger.log(`HTTP server listening on port ${String(appConfig.port)}`);
}
void bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
