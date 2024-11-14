import { Router } from 'express'
import config from '../../config'
import * as jwt from 'jsonwebtoken'

export function routeZoom(router: Router): void {
  router.post('/zoom/token', (req, res) => {
    const { sessionName, role } = req.body
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + config.zoomTokenExpirationSeconds

    const oPayload = {
      app_key: config.zoomVideoSdkKey,
      tpc: sessionName,
      role_type: role,
      iat,
      exp,
      version: 1,
    }

    const sPayload = JSON.stringify(oPayload)
    const sdkJwt = jwt.sign(sPayload, config.zoomVideoSdkSecret)
    return res.json({ signature: sdkJwt })
  })
}
