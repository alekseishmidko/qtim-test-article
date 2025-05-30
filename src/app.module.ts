import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import pgConfig from './config/db.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { JwtTokenModule } from './utils/jwt/jwt-token.module';
import { GuardsModule } from './guards/guards.module';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [pgConfig, redisConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [pgConfig.KEY],
      useFactory: (config: ConfigType<typeof pgConfig>) => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.dbName,
        autoLoadEntities: true,
      }),
    }),
    RedisModule,
    JwtTokenModule,
    GuardsModule,
    UserModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
