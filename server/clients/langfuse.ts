import { Langfuse } from 'langfuse-node'
import config from '../config'

export const client = new Langfuse({
  secretKey: config.langfuseSecretKey,
  publicKey: config.langfusePublicKey,
  baseUrl: config.langfuseBaseUrl,
})
