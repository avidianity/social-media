import { config } from 'dotenv';
import dotenv_expand from 'dotenv-expand';

const env = config();
dotenv_expand(env);

export default env;
