import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare function databaseConfig(config: ConfigService): TypeOrmModuleOptions;
