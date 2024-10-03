{ pkgs, ... }: {
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.docker
    pkgs.docker-compose
    pkgs.postgresql_14
  ];
  env = { SUBWAY_REDIS_HOST = "localhost"; SUBWAY_DB_HOST = "localhost"; NVM_DIR="~/.nvm"; PATH = ["~/.nvm/versions/node/v20.10.0/bin"]; };
  services.docker.enable = true;
  idx = {
    extensions = [
    ];
    previews = {
      enable = false;
    };
    workspace = {
      onCreate = {
        nvm-node-npm-install = "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && . ~/nvm.sh && . .idx/dev_setup.sh && unset NPM_CONFIG_PREFIX && npm install";
        default.openFiles = [ "README.md" ];
      };
      onStart = {
        default.openFiles = [ "README.md" ];
      };
    };
  };
}
