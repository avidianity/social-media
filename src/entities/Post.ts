import { Column, Entity, ManyToOne } from 'typeorm';
import { Model } from './Model';
import { User } from './User';

@Entity()
export class Post extends Model {
	@Column('text')
	body: string;

	@ManyToOne(() => User, (user) => user.posts)
	user: User;
}
