import * as Sentry from '@sentry/node'
import express, { Express } from 'express'
import { KeyNotFoundError } from '../../cache'
import logger from '../../logger'
import { WebSocketEmitter } from '../../services/WebSocketEmitterService'
import { UpgradedWebSocket } from '../../services/WebSocketEmitterService/types'
import * as WhiteboardService from '../../services/WhiteboardService'
import { asUlid } from '../../utils/type-utils'
import {
  CreationMode,
  decode,
  DecodeError,
  encode,
  Message,
  MessageType,
} from '../../utils/zwibblerDecoder'

const captureUnimplemented = (sessionId: string, messageType: string): void => {
  Sentry.captureMessage(
    `Unimplemented Zwibbler message type ${messageType} called in session ${sessionId}`
  )
}

const whiteboardChannel = 'whiteboard/'
const wsEmitter = new WebSocketEmitter(whiteboardChannel, { encoder: encode })

const messageHandlers: {
  [type in MessageType]: ({
    message,
    sessionId,
    wsClient,
  }: {
    message: Message
    sessionId: string
    wsClient: UpgradedWebSocket
  }) => void
} = {
  [MessageType.INIT]: async ({ message, sessionId, wsClient }) => {
    const sessionObjectId = asUlid(sessionId)
    let document
    try {
      document = await WhiteboardService.getDoc(sessionObjectId)
    } catch (error) {
      if (!(error instanceof KeyNotFoundError)) throw error
    }
    if (message.creationMode === CreationMode.NEVER_CREATE && !document) {
      return wsClient.send(
        encode({
          messageType: MessageType.ERROR,
          errorCode: DecodeError.DOES_NOT_EXIST,
          more: 0,
          description: 'does not exist',
        })
      )
    }
    if (message.creationMode === CreationMode.ALWAYS_CREATE && !document) {
      return wsClient.send(
        encode({
          messageType: MessageType.ERROR,
          errorCode: DecodeError.ALREADY_EXISTS,
          more: 0,
          description: 'already exists',
        })
      )
    }
    if (
      (message.creationMode === CreationMode.ALWAYS_CREATE ||
        message.creationMode === CreationMode.POSSIBLY_CREATE) &&
      !document
    ) {
      await WhiteboardService.createDoc(sessionObjectId)
      if (message.data)
        await WhiteboardService.appendToDoc(sessionObjectId, message.data)
      const docLength = await WhiteboardService.getDocLength(sessionObjectId)
      return wsClient.send(
        encode({
          messageType: MessageType.APPEND,
          offset: docLength,
          data: '',
          more: 0,
        })
      )
    }
    return wsClient.send(
      encode({
        messageType: MessageType.APPEND,
        offset: 0,
        data: document,
        more: 0,
      })
    )
  },
  [MessageType.APPEND]: async ({ message, sessionId, wsClient }) => {
    const sessionObjectId = asUlid(sessionId)
    const documentLength = await WhiteboardService.getDocLength(sessionObjectId)
    if (message.offset !== documentLength) {
      return wsClient.send(
        encode({
          messageType: MessageType.ACK_NACK,
          ack: 0,
          offset: documentLength,
          more: 0,
        })
      )
    }
    await WhiteboardService.appendToDoc(sessionObjectId, message.data)
    const newDocLength = await WhiteboardService.getDocLength(sessionObjectId)

    // Ack unless this is the beginning of a continuation
    if (!message.more) {
      wsClient.send(
        encode({
          messageType: MessageType.ACK_NACK,
          ack: 1,
          offset: newDocLength,
          more: 0,
        })
      )
    }
    const packet = {
      socketId: wsClient.id as string,
      message: {
        messageType: MessageType.APPEND,
        offset: documentLength,
        data: message.data,
        more: message.more,
      },
    }
    wsEmitter.broadcast(sessionId, packet)
  },
  [MessageType.SET_KEY]: ({ wsClient, sessionId }) => {
    captureUnimplemented(sessionId, 'SET_KEY')
    wsClient.send(
      encode({
        messageType: MessageType.ERROR,
        description: 'not implemented',
        errorCode: DecodeError.UNIMPLEMENTED_ERROR,
        more: 0,
      })
    )
  },
  [MessageType.BROADCAST]: ({ wsClient, sessionId }) => {
    captureUnimplemented(sessionId, 'BROADCAST')
    wsClient.send(
      encode({
        messageType: MessageType.ERROR,
        description: 'not implemented',
        errorCode: DecodeError.UNIMPLEMENTED_ERROR,
        more: 0,
      })
    )
  },
  [MessageType.ERROR]: ({ wsClient, sessionId }) => {
    captureUnimplemented(sessionId, 'ERROR')
    wsClient.send(
      encode({
        messageType: MessageType.ERROR,
        description: 'not implemented',
        errorCode: DecodeError.UNIMPLEMENTED_ERROR,
        more: 0,
      })
    )
  },
  [MessageType.ACK_NACK]: ({ wsClient, sessionId }) => {
    captureUnimplemented(sessionId, 'ACK_NACK')
    wsClient.send(
      encode({
        messageType: MessageType.ERROR,
        description: 'not implemented',
        errorCode: DecodeError.UNIMPLEMENTED_ERROR,
        more: 0,
      })
    )
  },
  [MessageType.KEY_INFORMATION]: ({ wsClient, sessionId }) => {
    captureUnimplemented(sessionId, 'KEY_INFORMATION')
    wsClient.send(
      encode({
        messageType: MessageType.ERROR,
        description: 'not implemented',
        errorCode: DecodeError.UNIMPLEMENTED_ERROR,
        more: 0,
      })
    )
  },
  [MessageType.SET_KEY_ACK_NACK]: ({ wsClient, sessionId }) => {
    captureUnimplemented(sessionId, 'SET_KEY_ACK_NACK')
    wsClient.send(
      encode({
        messageType: MessageType.ERROR,
        description: 'not implemented',
        errorCode: DecodeError.UNIMPLEMENTED_ERROR,
        more: 0,
      })
    )
  },
  [MessageType.CONTINUATION]: async ({ message, wsClient, sessionId }) => {
    const sessionObjectId = asUlid(sessionId)
    await WhiteboardService.appendToDoc(sessionObjectId, message.data)
    const newDocLength = await WhiteboardService.getDocLength(sessionObjectId)
    const packet = {
      socketId: wsClient.id as string,
      message: {
        messageType: MessageType.CONTINUATION,
        data: message.data,
        more: message.more,
      },
    }
    wsEmitter.broadcast(sessionId, packet)

    // Ack if this is the end of a continuation
    if (!message.more) {
      wsClient.send(
        encode({
          messageType: MessageType.ACK_NACK,
          ack: 1,
          offset: newDocLength,
          more: 0,
        })
      )
    }
  },
}

export function routes(app: Express): void {
  const router = express.Router()

  router.ws('/room/:sessionId', function(wsClient, req, next) {
    let initialized = false
    let sessionId: string

    try {
      // use string here for socket room
      sessionId = asUlid(req.params.sessionId)
    } catch (error) {
      logger.error(error as Error)
      return
    }

    wsEmitter.addClientToRoom(wsClient, sessionId)

    setTimeout(() => {
      if (!initialized) {
        console.log(
          `closing whiteboard socket connection for session ${sessionId}`
        )
        wsClient.close()
      }
    }, 30 * 1000)

    // Remove the websocket client from the room upon closing
    wsClient.on('close', () => {
      wsEmitter.removeClientFromRoom(wsClient, sessionId)
    })

    wsClient.on('message', rawMessage => {
      if (rawMessage === 'p1ng') {
        // Respond to ping and exit early
        wsClient.send('p0ng')
        return
      }
      let message = decode(rawMessage as Uint8Array)
      if (!message || !message.messageType) {
        console.log(`unsupported zwibbler client in session ${sessionId}`)
        message = {
          messageType: MessageType.ERROR,
        }
      }
      if (message.messageType === MessageType.INIT) initialized = true
      messageHandlers[message.messageType as MessageType]
        ? messageHandlers[message.messageType as MessageType]({
            message,
            sessionId,
            wsClient,
          })
        : wsClient.send({ error: 'unsupported message type' })
    })

    next()
  })

  router.ws('/admin/:sessionId', function(wsClient, req) {
    const sessionId = asUlid(req.params.sessionId)

    wsClient.on('message', async rawMessage => {
      const message = decode(rawMessage as Uint8Array)

      if (message.messageType === MessageType.INIT) {
        try {
          // Active session's document
          let document: string | undefined
          try {
            document = await WhiteboardService.getDoc(asUlid(sessionId))
          } catch (err) {
            if (!(err instanceof KeyNotFoundError)) throw err
          }
          // Get the completed session's whiteboard document from storage
          if (!document)
            document = await WhiteboardService.getDocFromStorage(sessionId)
          return wsClient.send(
            encode({
              messageType: MessageType.APPEND,
              offset: 0,
              data: document,
              more: 0,
            })
          )
        } catch (error) {
          if (!(error instanceof KeyNotFoundError)) throw error
        }
      }
    })
  })

  router.ws('/recap/:sessionId', function(wsClient, req) {
    const sessionId = asUlid(req.params.sessionId)
    let initialized = false

    // Allow 5 seconds for the server to respond to an INIT message otherwise
    // we'll close the socket connection to allow for Zwibbler to retry connecting
    setTimeout(() => {
      if (!initialized) wsClient.close()
    }, 5 * 1000)

    wsClient.on('message', async rawMessage => {
      const message = decode(rawMessage as Uint8Array)
      if (message.messageType === MessageType.INIT) {
        try {
          initialized = true
          // Get the completed session's whiteboard document from storage for session recap
          const document = await WhiteboardService.getDocFromStorage(sessionId)
          return wsClient.send(
            encode({
              messageType: MessageType.APPEND,
              offset: 0,
              data: document,
              more: 0,
            })
          )
        } catch (error) {
          Sentry.captureException(error)
          return wsClient.send(
            encode({
              messageType: MessageType.ERROR,
              errorCode: DecodeError.DOES_NOT_EXIST,
              more: 0,
              description: 'does not exist',
            })
          )
        }
      }
    })
  })

  router.route('/reset').post(async function(req, res, next) {
    const {
      body: { sessionId },
    } = req

    try {
      await WhiteboardService.deleteDoc(sessionId)
      res.sendStatus(200)
    } catch (err) {
      Sentry.captureException(err)
      next(err)
    }
  })

  app.use('/whiteboard', router)
}
