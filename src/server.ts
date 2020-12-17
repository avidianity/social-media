import app from './app';
import { log } from './helpers';

const PORT = process.env.APP_PORT || 8000;

app.listen(PORT, () => log(`App listening on port: ${PORT}`));

if (!('toJSON' in Error.prototype)) {
	(<any>Error.prototype).toJSON = function () {
		const data = {} as any;
		Object.keys(this).forEach((key) => {
			data[key] = this[key];
		});
		return data;
	};
}
