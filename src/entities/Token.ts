import { makeHash } from '../helpers';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { Model } from './Model';
import { User } from './User';

@Entity()
export class Token extends Model {
	@Column()
	hash: string;

	@ManyToOne(() => User, (user) => user.tokens)
	user: User;

	@BeforeInsert()
	makeHash() {
		this.hash = makeHash();
	}
}
