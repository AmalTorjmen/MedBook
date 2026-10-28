import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Connexion MySQL (XAMPP). `synchronize` est désactivé : le schéma est
 * géré par database/schema.sql (colonne générée + index unique).
 */
export function databaseConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.get<string>('DB_HOST', '127.0.0.1'),
    port: Number(config.get<string>('DB_PORT', '3306')),
    username: config.get<string>('DB_USER', 'root'),
    password: config.get<string>('DB_PASSWORD', ''),
    database: config.get<string>('DB_NAME', 'medbook'),
    autoLoadEntities: true,
    synchronize: false,
    timezone: 'local',
  };
}
