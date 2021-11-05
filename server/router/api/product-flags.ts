import { Router } from 'express'
import * as ProductFlagsService from '../../services/ProductFlagsService'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'

export function routeProductFlags(router: Router) {
  router.route('/product-flags').get(async function(req, res) {
    try {
      const user = extractUser(req)
      const flags = await ProductFlagsService.getPublicUPFByUserId(user._id)
      res.json({ flags })
    } catch (err) {
      resError(res, err)
    }
  })
}
