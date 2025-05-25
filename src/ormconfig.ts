import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { DataSource } from 'typeorm';

dotenv.config({ path: path.join(__dirname, '../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE_NAME,
  entities: [path.join(__dirname, '**/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
