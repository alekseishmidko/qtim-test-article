import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtTokenService } from './utils/jwt/jwt-token.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Qtim test task api')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addCookieAuth(JwtTokenService.REFRESH_TOKEN, {
      type: 'http',
      in: 'cookie',
    })
    .build();
  const swagger = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swagger, {
    customSiteTitle: 'article-test-task-api',
  });

  const PORT = process.env.PORT ?? 2345;
  await app.listen(PORT);
  console.log(
    `server started on: http://localhost:${PORT}/api \n check:  http://localhost:${PORT}/api/docs`,
  );
}

bootstrap();
