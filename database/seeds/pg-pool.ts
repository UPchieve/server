import pg from 'pg'

const pool = new pg.Pool({
    // TODO: pull this out to some sort of config to match the docker pg setting
    // connectionString: 'your real connection string',
    connectionString: 'postgres://subway:Password123@localhost:5432/upchieve',
    // used with the real connection string
    // ssl: {
        // rejectUnauthorized: false
    // }
})
pool.on('error', err => console.error(err))  // don't let a pg restart kill the app

export default pool;
