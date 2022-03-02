FROM postgres:14
ENV POSTGRES_PASSWORD Password123
ENV POSTGRES_DB upchieve
ENV POSTGRES_USER admin
COPY ./database/db_init/schema.sql /docker-entrypoint-initdb.d/init_db.sql
COPY ./database/db_init/auth.sql /docker-entrypoint-initdb.d/init_roles.sql
COPY ./database/db_init/seeds.sql /docker-entrypoint-initdb.d/seeds.sql

HEALTHCHECK --interval=1s --retries=10 --start-period=2s CMD ["pg_isready"]