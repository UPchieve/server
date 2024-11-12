import { KJUR } from 'jsrsasign'
import SocketService from '../../services/SocketService'
import { extractUser } from '../extract-user'

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

  router.post('/zoom/join/:sessionId', async (req, res) => {
    const { sessionId } = req.params
    const user = extractUser(req)
    const socketService = SocketService.getInstance()
    await socketService.emitPartnerJoinedCall(sessionId, user.id)
    return res.status(200).json({ success: true })
  })

  router.post('/zoom/leave/:sessionId', async (req, res) => {
    const { sessionId } = req.params
    const socketService = SocketService.getInstance()
    const user = extractUser(req)
    await socketService.emitPartnerLeftCall(sessionId, user.id)
    return res.status(200).json({ success: true })
  })
}
