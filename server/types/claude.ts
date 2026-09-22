import { TypedImage } from '../utils/image-utils'

export enum ClaudeToolChoice {
  AUTO = 'auto',
  ANY = 'any',
  NONE = 'none',
  TOOL = 'tool',
}

/**
 * The JSON Schema subset we use, narrower than what Anthropic accepts. Strict
 * tool use rejects schemas without `additionalProperties: false`, and omitting
 * a property from `required` is the only way to make it optional.
 * https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use
 */
export type ClaudeToolSchema =
  | {
      type: 'object'
      description?: string
      properties: Record<string, ClaudeToolSchema>
      required: Array<string>
      additionalProperties: false
    }
  | {
      type: 'array'
      description?: string
      items: ClaudeToolSchema
    }
  | {
      type: 'string' | 'number' | 'integer' | 'boolean'
      description?: string
      enum?: Array<string>
    }

export type ClaudeTools = Array<{
  name: string
  description: string
  strict: true
  input_schema: Extract<ClaudeToolSchema, { type: 'object' }>
}>

/** `name` is required only when forcing a specific tool, as the API defines it. */
export type ClaudeToolChoiceValue =
  | {
      type: ClaudeToolChoice.AUTO | ClaudeToolChoice.ANY | ClaudeToolChoice.NONE
    }
  | { type: ClaudeToolChoice.TOOL; name: string }

export type ClaudeToolsAttribute = {
  tools: ClaudeTools
  tool_choice: ClaudeToolChoiceValue
}

export type TextContent = {
  type: 'text'
  text: string
}

export type ImageContent = {
  type: 'image'
  source: {
    type: 'base64'
    media_type: TypedImage['mediaType']
    data: string
  }
}

export type AnthropicMessagePayload = {
  max_tokens: number
  system: string
  messages: Array<{
    role: 'user'
    content: Array<TextContent | ImageContent>
  }>
  tools?: ClaudeTools
  tool_choice?: ClaudeToolChoiceValue
}

export type ToolInput = Record<string, any>

export type ClaudeResponse = {
  stop_reason?: string
  content: Array<{ type?: string; input?: unknown; text?: string }>
  usage?: { input_tokens?: number; output_tokens?: number }
}

export type ClaudeProvider = {
  name: string
  /** Foundry serves every request from one deployment, so this is per provider. */
  modelFor(modelId: string): string
  send(
    payload: AnthropicMessagePayload,
    model: string,
    deadline: AbortSignal
  ): Promise<ClaudeResponse>
}
