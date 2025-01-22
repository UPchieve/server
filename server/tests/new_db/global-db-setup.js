const { execSync } = require('child_process')

module.exports = async () => {
  if (process.env.CI) {
    try {
      execSync('apt-get update && apt-get install -y postgresql-client', {
        stdio: 'inherit',
      })
    } catch (error) {
      console.error('Error installing PostgreSQL client:', error)
      throw error
    }
  }
}
