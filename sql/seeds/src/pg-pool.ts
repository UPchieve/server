import pg from 'pg';

// TODO: could do this instead  https://github.com/brianc/node-postgres/issues/1123#issuecomment-501510375
process.env.PGOPTIONS = "-c search_path=upchieve"

const pool = new pg.Pool({
    // TODO: pull this out to some sort of config to match the docker pg setting
    // connectionString: 'your real connection string',
    connectionString: 'postgres://admin:Password123@localhost:5432/upchieve',
    // used with the real connection string
    // ssl: {
        // rejectUnauthorized: false
    // }
})
pool.on('error', err => console.error(err))  // don't let a pg restart kill the app

export default pool;
