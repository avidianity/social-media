import { hashSync } from 'bcrypt';
import { Request, Response, Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import { User } from '../entities';
import { log, unique } from '../helpers';
import { admin, auth } from '../middlewares';

const router = Router();

router.get('/', auth(), async (req: Request, res: Response) => {
	try {
		const users = await User.find();
		return res.json(users);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

router.get('/:id', auth(), async (req, res) => {
	try {
		const id = req.params.id;
		const user = await User.findOne(id);
		if (!user) {
			return res.status(404).json({
				message: 'User does not exist.',
			});
		}
		return res.json(user);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

router.get('/:id/posts', auth(), async (req, res) => {
	try {
		const id = req.params.id;
		const user = await User.findOne(id, {
			relations: ['posts'],
		});
		if (!user) {
			return res.status(404).json({
				message: 'User does not exist.',
			});
		}
		return res.json(user.posts);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

function update() {
	return [
		auth(),
		[
			body('username')
				.notEmpty()
				.bail()
				.isString()
				.bail()
				.custom(unique(User, 'username'))
				.bail()
				.optional(),
			body('password').notEmpty().bail().isString().bail().optional(),
		],
		async (req: Request, res: Response) => {
			try {
				const errors = validationResult(req);

				if (!errors.isEmpty()) {
					return res.status(422).json(errors.array());
				}
				const id = req.params.id;

				const data = matchedData(req, { locations: ['body'] });
				const user = await User.findOne(id);
				if (!user) {
					return res
						.status(404)
						.json({ message: 'User does not exist.' });
				}
				const self = req.user as User;
				if (self.role !== 'Admin' && self.id !== user.id) {
					return res
						.status(403)
						.json({ message: 'You cannot update this account.' });
				}
				if ('password' in data) {
					data.password = hashSync(data.password, 10);
				}
				return res.json(await user.fill(data).save());
			} catch (error) {
				log(error);
				return res.status(500).json(error);
			}
		},
	];
}

router.put('/:id', update());
router.patch('/:id', update());

router.delete('/:id', auth(), async (req, res) => {
	try {
		const id = req.params.id;
		const self = req.user as User;
		const user = await User.findOne(id);
		if (!user) {
			return res.status(404).json({
				message: 'User does not exist.',
			});
		}
		if (self.role !== 'Admin' && self.id !== user.id) {
			return res
				.status(403)
				.json({ message: 'You cannot delete this account.' });
		}
		await user.remove();
		return res.sendStatus(204);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

export default router;
