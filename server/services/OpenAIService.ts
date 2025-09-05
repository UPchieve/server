import 'openai/shims/node'
import OpenAI from 'openai'
import config from '../config'
import logger from '../logger'

export const openai = new OpenAI({
  apiKey: config.openAIApiKey,
})

export const MODEL_ID = config.openAIModelId

export enum OpenAiResponseType {
  JSON = 'json_object',
  TEXT = 'text',
}
export type OpenAiInput = {
  prompt: string
  userMessage: string | Array<OpenAI.ChatCompletionContentPart>
  responseType?: OpenAiResponseType
}

export type OpenAiResults = {
  modelId: string
  results: string | object
}

export async function invokeModel({
  prompt,
  userMessage,
  responseType = OpenAiResponseType.JSON,
}: OpenAiInput): Promise<OpenAiResults> {
  let results = null
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: responseType },
    })

    results = getResults(response, responseType)
    if (!results) throw new Error("Didn't get an expected openai chat response")
  } catch (err) {
    logger.error(err)
    throw err
  }

  return {
    modelId: MODEL_ID,
    results,
  }
}

function getResults(
  result: OpenAI.ChatCompletion,
  responseType: OpenAiResponseType
) {
  if (!result?.choices[0]?.message?.content) {
    return null
  }

  return responseType === OpenAiResponseType.JSON
    ? JSON.parse(result.choices[0].message.content)
    : result.choices[0].message.content
}
