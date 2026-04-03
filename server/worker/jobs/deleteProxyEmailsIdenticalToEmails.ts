import { deleteProxyEmailsIdenticalToEmails } from '../../models/User'
import { runInTransaction } from '../../db'
import logger from '../../logger'

const logPrefix = 'Proxy Email Cleanup: '
export default async function () {
  logger.info(
    `${logPrefix}About to clean up proxy emails that are identical to the user's email`
  )
  await runInTransaction(async (tc) => {
    const numDeleted = await deleteProxyEmailsIdenticalToEmails(tc)
    logger.info(`${logPrefix}Cleaned up ${numDeleted} proxy emails`)
  })
}
