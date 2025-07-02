const LTI_KEY = 'your-dev-secret-key' // use a secure random string in prod

async function setupLTI(app) {
  const lti = require('ltijs').Provider

  lti.setup(
    LTI_KEY,
    {
      url: 'mongodb://localhost/ltijsdb',
      connection: {},
    },
    {
      appRoute: '/',
      loginRoute: '/login',
      cookie: {
        secure: true,
        sameSite: 'None',
      },
      devMode: true,
    }
  )

  lti.onConnect(async (token, req, res) => {
    console.log('****token', token)
    return res.send(`It's alive!`)
  })

  const setup = async () => {
    await lti.deploy({ app, serverless: true })
  }

  setup()
}

module.exports = setupLTI
