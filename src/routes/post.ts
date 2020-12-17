import { Request, Response, Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import { Post, User } from '../entities';
import { log } from '../helpers';
import { auth } from '../middlewares';

const router = Router();

router.get('/', auth(), async (req, res) => {
	try {
		const posts = await Post.find({
			order: {
				updatedAt: 'DESC',
			},
			relations: ['user'],
		});
		return res.json(posts);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

router.get('/:id', auth(), async (req, res) => {
	try {
		const id = req.params.id;
		const post = await Post.findOne(id, {
			relations: ['user'],
		});
		if (!post) {
			return res.status(404).json({
				message: 'Post does not exist.',
			});
		}
		return res.json(post);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

router.post(
	'/',
	auth(),
	[body('body').notEmpty().bail().isString()],
	async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return res.status(422).json(errors.array());
			}

			const { body } = matchedData(req, { locations: ['body'] });
			const user = req.user as User;
			const post = new Post({
				body,
			});
			post.user = user;
			return res.json(await post.save());
		} catch (error) {
			log(error);
			return res.status(500).json(error);
		}
	}
);

function update() {
	return [
		auth(),
		[body('body').notEmpty().bail().isString()],
		async (req: Request, res: Response) => {
			try {
				const errors = validationResult(req);

				if (!errors.isEmpty()) {
					return res.status(422).json(errors.array());
				}
				const id = req.params.id;

				const { body } = matchedData(req, { locations: ['body'] });
				const post = await Post.findOne(id, {
					relations: ['user'],
				});
				if (!post) {
					return res
						.status(404)
						.json({ message: 'Post does not exist.' });
				}
				const user = req.user as User;
				if (user.role !== 'Admin' && user.id !== post.user.id) {
					return res
						.status(403)
						.json({ message: 'This post does not belong to you.' });
				}
				post.body = body;
				return res.json(await post.save());
			} catch (error) {
				log(error);
				return res.status(500).json(error);
			}
		},
	];
}

router.put('/:id', ...update());
router.patch('/:id', ...update());

router.delete('/:id', auth(), async (req, res) => {
	try {
		const id = req.params.id;
		const user = req.user as User;
		const post = await Post.findOne(id, {
			relations: ['user'],
		});
		if (!post) {
			return res.status(404).json({
				message: 'Post does not exist.',
			});
		}
		if (user.role !== 'Admin' && user.id !== post.user.id) {
			return res.status(403).json({
				message: 'This post does not belong to you.',
			});
		}
		return res.json(post);
	} catch (error) {
		log(error);
		return res.status(500).json(error);
	}
});

export default router;
