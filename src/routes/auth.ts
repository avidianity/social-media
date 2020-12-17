import { User, Token } from '../entities';
import { log, unique } from '../helpers';
import { Router, Request, Response } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import { compareSync, hashSync } from 'bcrypt';
import { guest } from '../middlewares';

const router = Router();

router.post(
	'/login',
	guest(),
	[
		body('username').notEmpty().bail().isString(),
		body('password').notEmpty().bail().isString(),
	],
	async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return res.status(422).json(errors.array());
			}

			const { username, password } = matchedData(req, {
				locations: ['body'],
			});

			const user = await User.findOne({
				where: [
					{
						email: username,
					},
					{
						username,
					},
				],
			});
			if (!user) {
				return res.status(404).json({
					message: 'Username does not exist.',
				});
			}
			if (!compareSync(password, user.password)) {
				return res.status(403).json({ message: 'Incorrect password.' });
			}

			const token = await new Token({
				user,
			}).save();

			return res.status(200).json({
				user,
				token: token.hash,
			});
		} catch (error) {
			log(error);
			return res.status(500).json(error);
		}
	}
);

router.post(
	'/register',
	guest(),
	[
		body('username')
			.notEmpty()
			.bail()
			.isString()
			.bail()
			.custom(unique(User, 'username')),
		body('email')
			.notEmpty()
			.bail()
			.isEmail()
			.bail()
			.custom(unique(User, 'email')),
		body('password').notEmpty().bail().isString(),
	],
	async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return res.status(422).json(errors.array());
			}

			const { username, password, email } = matchedData(req, {
				locations: ['body'],
			});

			const user = await new User({
				username,
				password: hashSync(password, 10),
				email,
			}).save();

			const token = await new Token({
				user,
			}).save();

			return res.status(200).json({
				user,
				token: token.hash,
			});
		} catch (error) {
			log(error);
			return res.status(500).json(error);
		}
	}
);

export default router;
