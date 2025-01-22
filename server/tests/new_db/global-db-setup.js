const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../../../')
const DB_INIT_DIR = path.join(ROOT_DIR, 'database/db_init')

module.exports = async () => {
  if (process.env.CI) {
    try {
      console.log('Installing PostgreSQL client...')
      execSync('apt-get update && apt-get install -y postgresql-client', {
        stdio: 'inherit',
      })
      console.log('PostgreSQL client installed successfully.')

      try {
      
              const sqlFiles = [
                'schema.sql',
                'auth.sql',
                'local_auth.sql',
                'test_seeds.sql',
                'seed_migrations.sql',
                'refresh_materialized_views.sql',
              ]
      
              try {
                for (const file of sqlFiles) {
                  const filePath = path.join(DB_INIT_DIR, file)
                  if (fs.existsSync(filePath)) {
                    console.log(`Executing ${filePath}...`)
                    execSync(
                      `PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${DEFAULT_DB} -f ${filePath}`,
                      { stdio: 'inherit' }
                    )
                  } else {
                    console.warn(`SQL file not found: ${filePath}`)
                  }
                }
              } catch (error) {
                console.error('Error executing SQL scripts:', error)
                throw error
              }
            } catch (error) {
              console.error('Error installing PostgreSQL client:', error)
              throw error
            }
    } catch (error) {
      console.error(
        'Error during global setup (PostgreSQL client installation):',
        error
      )
      throw error
    }
  }
}
