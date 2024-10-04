{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.docker
    pkgs.docker-compose
    pkgs.postgresql_14
  ];
  env = { };
  services.docker.enable = true;
  idx = {
    extensions = [
    ];
    previews = {
      enable = false;
    };
    workspace = {
      onCreate = {
      };
      onStart = {
        default.openFiles = [ "README.md" ];
      };
    };
  };
}