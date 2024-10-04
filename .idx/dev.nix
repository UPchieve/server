{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.docker
    pkgs.docker-compose
    pkgs.postgresql_14
  ];
  env = { SUBWAY_REDIS_HOST = "localhost"; SUBWAY_DB_HOST = "localhost"; NVM_DIR="$HOME/.nvm"; PATH = ["$HOME/.nvm/versions/node/v20.10.0/bin"]; NPM_CONFIG_PREFIX=""; };
  services.docker.enable = true;
  idx = {
    extensions = [
    ];
    previews = {
      enable = false;
    };
    workspace = {
      onCreate = {
        install-node = "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
                        . $HOME/.nvm/nvm.sh && \
                        nvm install v20.10.0";
      };
      onStart = {
        default.openFiles = [ "README.md" ];
      };
    };
  };
}