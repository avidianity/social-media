import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './config';
import './database';
import passport from 'passport';
import { Strategy as BearerStategy } from 'passport-http-bearer';

import { auth, post, user } from './routes';
import { Token } from './entities';

passport.use(
	new BearerStategy(async (hash, done) => {
		try {
			const token = await Token.findOne({
				where: {
					hash,
				},
			});
			if (!token) {
				return done(null, false);
			}
			return done(null, token.user);
		} catch (error) {
			return done(error);
		}
	})
);

const app = express();
app.use(json());
app.use(
	cors({
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	})
);
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', auth);
app.use('/api/posts', post);
app.use('/api/users', user);

app.use((req, res) => {
	return res.status(404).json({ message: 'Not Found' });
});

export default app;
