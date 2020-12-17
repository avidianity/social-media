import cryptoRandomString, { async } from 'crypto-random-string';
import { Model } from './entities/Model';

export function log<K extends keyof Console>(message: any, mode?: K) {
	const method = mode ? mode : ('log' as K);
	console[method](`⚡: ${message}`);
}

export function makeHash() {
	return cryptoRandomString({ length: 60 });
}

export function ucFirst(string: string) {
	return string
		.split('')
		.map((letter, index) => (index === 0 ? letter.toUpperCase() : letter))
		.join('');
}

export function unique<T extends Model, K extends keyof T>(
	model: { new (): T },
	field: K
) {
	return async (value: any) => {
		try {
			const exists = (await (<any>model).findOne({
				where: {
					[field]: value,
				},
			})) as T | undefined;
			if (exists) {
				return Promise.reject(
					`${ucFirst(field as string)} already exists.`
				);
			}
			return true;
		} catch (error) {
			log(error);
			return Promise.reject(
				`Unable to verify '${ucFirst(field as string)}'.`
			);
		}
	};
}
