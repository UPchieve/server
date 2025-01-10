const { Client } = require('pg');

const waitForPostgres = async () => {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'test_user',
    password: process.env.POSTGRES_PASSWORD || 'test_password',
    database: process.env.POSTGRES_DB || 'postgres',
  });

  let retries = 10;
  while (retries) {
    try {
      await client.connect();
      console.log('PostgreSQL is ready.');
      await client.end();
      return;
    } catch (err) {
      retries -= 1;
      console.log('Waiting for PostgreSQL...');
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  throw new Error('PostgreSQL is not ready after retries.');
};

waitForPostgres().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
