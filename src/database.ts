import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { log } from './helpers';
import { User, Token, Post } from './entities';

const type = process.env.DB_CONNECTION as string;
const host = process.env.DB_HOST as string;
const port = process.env.DB_PORT as string;
const username = process.env.DB_USERNAME as string;
const password = process.env.DB_PASSWORD as string;
const database = process.env.DB_NAME as string;

createConnection({
	type,
	host,
	port,
	username,
	password,
	database,
	entities: [User, Token, Post],
	synchronize: process.env.APP_ENV !== 'production',
	logging: process.env.APP_DEBUG === 'true',
} as any)
	.then(() => {
		log('Connected to database.');
	})
	.catch((error) => {
		log(error);
		process.exit(500);
	});
