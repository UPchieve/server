import axios from 'axios'
import logger from '../../../logger'
import config from '../../../config'

export default async function turnOffStandaloneAiTutor() {
  // Turn off the feature flag to hide the tutor bot
  try {
    await setFeatureFlagEnabled(false)
  } catch (err) {
    logger.error(err, 'Failed to turn off the standalone AI tutor feature flag')
    return // @TODO - I think we bail here, if we can't turn the flag off we should leave everything on for users, since they can see the feature.
  }

  // Now, scale down the Huggingface instance to 0
  try {
    await pauseTutorBotInstance()
  } catch (err) {
    logger.error(err, 'Failed to pause the tutor bot instance')
    // @TODO What now? Throw an error I guess?
  }
}

async function setFeatureFlagEnabled(enable: boolean) {
  // See https://posthog.com/docs/api/feature-flags#get-api-projects-project_id-feature_flags-id
  const requestUrl = `${config.posthogHost}/api/projects/${config.posthogProjectId}/feature_flags/${config.posthogStandaloneAiTutorFeatureFlagId}`
  const phResponse = await axios.patch(
    requestUrl,
    {
      active: enable,
    },
    {
      headers: {
        Authorization: `Bearer ${config.posthogPersonalApiToken}`,
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
  try {
    await axios.post(requestUrl, undefined, {
      headers: {
        Authorization: `Bearer ${config.tutorBotApiKey}`, // @TODO use the cron credential instead
      },
      validateStatus: (status: number) => status === 200,
    })
  } catch (err) {
    logger.error(err, 'Failed to pause tutor bot instance')
    // @TODO What now? Page the on call...
  }
}

async function startTutorBotInstance() {
  const hfBaseUrl = 'api.endpoints.huggingface.cloud'
  const requestUrl = `https://${hfBaseUrl}/v2/endpoint/${config.tutorBotHuggingfaceNamespace}/${config.tutorBotHuggingfaceInstanceName}/resume`
  try {
    await axios.post(requestUrl, undefined, {
      headers: {
        Authorization: `Bearer ${config.tutorBotApiKey}`, // @TODO use the cron credential instead
      },
      validateStatus: (status: number) => status === 200,
    })
  } catch (err) {
    logger.error(err, 'Failed to initiate resume action on tutor bot instance')
    // @TODO What now? Page the on call...
  }
}
