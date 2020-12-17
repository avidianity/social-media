import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { User } from './entities';

export function auth() {
	return passport.authenticate('bearer', { session: false });
}

export function admin() {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user as User;
		if (user.role !== 'Admin') {
			return res.status(403).json({
				message: 'You are unauthorized.',
			});
		}
		return next();
	};
}

export function guest() {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.user) {
			return res.status(403).json({
				message: 'You are currently logged in.',
			});
		}
		return next();
	};
}
