import pg from "pg";
const {Pool} = pg;
import type {PoolConfig} from "pg";

const env = useRuntimeConfig();

const poolConfig: PoolConfig = {
	...env.db,
	ssl: {
		rejectUnauthorized: false,
	},
	max: 10,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

export default pool;
