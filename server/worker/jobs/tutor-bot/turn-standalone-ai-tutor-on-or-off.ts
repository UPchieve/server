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
    await startTutorBotInstance()
    await setFeatureFlagEnabled(true)
  } catch (err) {
    const errorMsg = 'Failed to turn standalone ai tutor on'
    logger.error(err, errorMsg)
    throw new Error(errorMsg)
  }
}

async function setFeatureFlagEnabled(enable: boolean) {
  // See https://posthog.com/docs/api/feature-flags#get-api-projects-project_id-feature_flags-id
  const requestUrl = `https://us.i.posthog.com/api/projects/${config.posthogProjectId}/feature_flags/${config.posthogStandaloneAiTutorFeatureFlagId}`
  const data = {
    active: enable,
  }
  const phResponse = await axios.patch(requestUrl, data, {
    headers: {
      Authorization: `Bearer ${config.posthogFeatureFlagApiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  })

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
      Authorization: `Bearer ${config.huggingFaceInferenceApiKey}`,
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  })
}

async function startTutorBotInstance() {
  const hfBaseUrl = 'api.endpoints.huggingface.cloud'
  const requestUrl = `https://${hfBaseUrl}/v2/endpoint/${config.tutorBotHuggingfaceNamespace}/${config.tutorBotHuggingfaceInstanceName}/resume`
  await axios.post(requestUrl, undefined, {
    headers: {
      Authorization: `Bearer ${config.huggingFaceInferenceApiKey}`,
    },
    validateStatus: (status: number) => status === 200,
  })
}
