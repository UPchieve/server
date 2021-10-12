// MongoDB Memeory Server configuration for running tests
module.exports = {
  mongodbMemoryServerOptions: {
    instance: {},
    binary: {
      version: '4.4.5', // Version of MongoDB
      skipMD5: true
    },
    autoStart: false
  },
  useSharedDBForAllJestWorkers: false
}
