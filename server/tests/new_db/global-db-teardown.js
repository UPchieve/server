const { execSync } = require('child_process');

module.exports = async () => {
  if (process.env.CI) {
    try {
      console.log('Cleaning up PostgreSQL client...');
      execSync('apt-get remove --purge -y postgresql-client', { stdio: 'inherit' });
      execSync('apt-get autoremove -y', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error cleaning up PostgreSQL client:', error);
    }
  }
}