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
        secure: false,
        sameSite: 'Lax',
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

    await lti.registerPlatform({
      url: 'http://localhost:3000', // or your Canvas URL if remote
      name: 'Canvas',
      clientId: '10000000000001',
      authenticationEndpoint:
        'https://canvas.instructure.com/login/oauth2/auth', // Canvas OAuth endpoint
      accesstokenEndpoint: 'https://canvas.instructure.com/login/oauth2/token',
      authConfig: {
        method: 'JWK_SET',
        key: 'https://canvas.instructure.com/api/lti/security/jwks',
      },
    })
  }

  setup()
}

module.exports = setupLTI
