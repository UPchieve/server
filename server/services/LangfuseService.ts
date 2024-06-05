import { Langfuse } from 'langfuse-node'
import config from '../config'

export const langfuse: Langfuse = new Langfuse({
  secretKey: config.langfuseSecretKey,
  publicKey: config.langfusePublicKey,
  baseUrl: config.langfuseBaseUrl,
  release: config.NODE_ENV, // @TODO Update me: This is fine while testing locally ('dev'), but this won't work for stg/prod
})
