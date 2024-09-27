import axios from 'axios'
import config from '../config'
import logger from '../logger'

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
    await forceScaleToZero()
  } catch (err) {
    logger.error(err, 'Failed to scale down the tutor bot')
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

async function forceScaleToZero() {
  const hfBaseUrl = 'api.endpoints.huggingface.cloud'
  const requestUrl = `https://${hfBaseUrl}/v2/endpoint/${config.tutorBotHuggingfaceNamespace}/${config.tutorBotHuggingfaceInstanceName}/scale-to-zero`
  try {
    await axios.post(requestUrl, undefined, {
      headers: {
        Authorization: `Bearer ${config.tutorBotApiKey}`,
      },
    })
  } catch (err) {
    logger.error(err, 'Failed to scale tutor bot instance to zero')
    // @TODO What now? Page the on call...
  }
}
