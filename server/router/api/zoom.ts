import { KJUR } from 'jsrsasign'

export function routeZoom(router: Router): void {
  router.post('/zoom', (req, res) => {
    const { meetingNumber, role, expirationSeconds } = req.body
    const iat = Math.floor(Date.now() / 1000)
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
    const oHeader = { alg: 'HS256', typ: 'JWT' }

    const oPayload = {
      appKey: process.env.ZOOM_MEETING_SDK_KEY,
      sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
      mn: meetingNumber,
      role,
      iat,
      exp,
      tokenExp: exp,
    }

    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const sdkJWT = KJUR.jws.JWS.sign(
      'HS256',
      sHeader,
      sPayload,
      process.env.ZOOM_MEETING_SDK_SECRET
    )
    return res.json({ signature: sdkJWT })
  })
}
