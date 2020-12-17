import { BeforeRemove, Column, Entity, OneToMany } from 'typeorm';
import { Model } from './Model';
import { Post } from './Post';
import { Token } from './Token';

@Entity()
export class User extends Model {
	@Column()
	username: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@OneToMany(() => Token, (token) => token.user)
	tokens: Array<Token>;

	@OneToMany(() => Post, (post) => post.user)
	posts: Array<Post>;

	@Column()
	role: 'Admin' | 'Member' = 'Member';

	@BeforeRemove()
	async removeRelationships() {
		const postRepo = Post.getRepository();
		await postRepo
			.createQueryBuilder()
			.delete()
			.from(Post)
			.where('userId = :id', { id: this.id })
			.execute();
		const tokenRepo = Token.getRepository();
		await tokenRepo
			.createQueryBuilder()
			.delete()
			.from(Token)
			.where('userId = :id', { id: this.id })
			.execute();
	}
}
