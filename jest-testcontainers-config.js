module.exports = {
  postgres: {
    image: 'subway-postgres',
    ports: [5432],
    env: {
      EXAMPLE: 'env',
    },
    wait: {
      type: 'text',
      text: 'init process complete'
    }
  }
}
