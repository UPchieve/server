unset NPM_CONFIG_PREFIX
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. $HOME/.nvm/nvm.sh
nvm install
nvm use
npm install

export SUBWAY_REDIS_HOST=localhost; 
export SUBWAY_DB_HOST=localhost
