import axios from 'axios'
import logger from '../../../logger'
import config from '../../../config'

/**
 * Turn off the FF to hide the feature from users,
 * and permanently scale down Huggingface instances hosting the model.
 */
export async function turnOffStandaloneAiTutor() {
  try {
    await setFeatureFlagEnabled(false)
    await pauseTutorBotInstance()
  } catch (err) {
    const errorMsg = 'Failed to turn standalone ai tutor off'
    logger.error(err, errorMsg)
    throw new Error(errorMsg)
  }
}

/**
 * Turn on the FF to expose the feature to users,
 * and scale up the Huggingface instances hosting the model.
 */
export async function turnOnStandaloneAiTutor() {
  try {
    await setFeatureFlagEnabled(true)
    await startTutorBotInstance()
  } catch (err) {
    const errorMsg = 'Failed to turn on the standalone AI tutor feature flag'
    logger.error(err, errorMsg)
    throw new Error(errorMsg)
  }
}

async function setFeatureFlagEnabled(enable: boolean) {
  // See https://posthog.com/docs/api/feature-flags#get-api-projects-project_id-feature_flags-id
  const requestUrl = `https://${config.posthogHost}/api/projects/${config.posthogProjectId}/feature_flags/${config.posthogStandaloneAiTutorFeatureFlagId}`
  const phResponse = await axios.patch(
    requestUrl,
    {
      active: enable,
    },
    {
      headers: {
        Authorization: `Bearer ${config.posthogFeatureFlagApiToken}`, // @TODO Use a new secret and new token for just this scope.
      },
    }
  )
  const isEnabled = phResponse.data.active
  if (isEnabled !== enable) {
    throw new Error(
      `Could not ${enable ? 'enable' : 'disable'} the AI tutor feature flag`
    )
  }
}

/**
 * Pauses the tutor bot Huggingface instance (causing it to scale to zero and stop incurring charges)
 */
async function pauseTutorBotInstance() {
  const hfBaseUrl = 'api.endpoints.huggingface.cloud'
  const requestUrl = `https://${hfBaseUrl}/v2/endpoint/${config.tutorBotHuggingfaceNamespace}/${config.tutorBotHuggingfaceInstanceName}/pause`
  await axios.post(requestUrl, undefined, {
    headers: {
      Authorization: `Bearer ${config.tutorBotApiKey}`, // @TODO use the cron credential instead
    },
    validateStatus: (status: number) => status === 200,
  })
}

async function startTutorBotInstance() {
  const hfBaseUrl = 'api.endpoints.huggingface.cloud'
  const requestUrl = `https://${hfBaseUrl}/v2/endpoint/${config.tutorBotHuggingfaceNamespace}/${config.tutorBotHuggingfaceInstanceName}/resume`
  await axios.post(requestUrl, undefined, {
    headers: {
      Authorization: `Bearer ${config.tutorBotApiKey}`, // @TODO use the cron credential instead
    },
    validateStatus: (status: number) => status === 200,
  })
}
