import { KJUR } from 'jsrsasign'

export function routeZoom(router: Router): void {
  router.post('/zoom', (req, res) => {
    const { sessionName, role, expirationSeconds } = req.body
    const iat = Math.floor(Date.now() / 1000)
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
    const oHeader = { alg: 'HS256', typ: 'JWT' }

    const oPayload = {
      app_key: process.env.ZOOM_VIDEO_SDK_KEY,
      tpc: sessionName,
      role_type: role,
      iat,
      exp,
      version: 1,
    }

    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const sdkJWT = KJUR.jws.JWS.sign(
      'HS256',
      sHeader,
      sPayload,
      process.env.ZOOM_VIDEO_SDK_SECRET
    )
    return res.json({ signature: sdkJWT })
  })
}
