import { registerAs } from '@nestjs/config';

export default registerAs('PG_CONFIG', () => ({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DATABASE_NAME,
}));
