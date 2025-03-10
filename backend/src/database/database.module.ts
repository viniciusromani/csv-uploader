import { Global, Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

const logger = new Logger('DatabaseModule');

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        try {
          const config: TypeOrmModuleOptions = {
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            autoLoadEntities: true,
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: true } : false,
          };
          logger.log('Database connected successfully');
          return config;
        } catch (error) {
          logger.error('Error connecting to database:', error.message);
          throw error;
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
