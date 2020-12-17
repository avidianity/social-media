import {
	BaseEntity,
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export abstract class Model extends BaseEntity {
	constructor(data?: any) {
		super();
		if (data) {
			Object.keys(data).forEach((key) => {
				(<any>this)[key] = data[key];
			});
		}
	}

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	createdAt: Date;

	@Column()
	updatedAt: Date;

	@BeforeInsert()
	createDates() {
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	@BeforeUpdate()
	updateDate() {
		this.updatedAt = new Date();
	}

	fill(data: any) {
		Object.keys(data).forEach((key) => {
			(<any>this)[key] = data[key];
		});
		return this;
	}
}
