import express from 'express'
import * as Sentry from '@sentry/node'
import * as WhiteboardService from '../../services/WhiteboardService'
import {
  decode,
  encode,
  Message,
  MessageType,
  DecodeError,
  CreationMode
} from '../../utils/zwibblerDecoder'
import { WebSocketEmitter } from '../../services/WebSocketEmitterService'
import { UpgradedWebSocket } from '../../services/WebSocketEmitterService/types'
import { asStringObjectId } from '../../utils/type-utils'
import logger from '../../logger'

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
    wsClient
  }: {
    message: Message
    sessionId: string
    wsClient: UpgradedWebSocket
  }) => void
} = {
  [MessageType.INIT]: async ({ message, sessionId, wsClient }) => {
    const document = await WhiteboardService.getDoc(sessionId)
    if (message.creationMode === CreationMode.NEVER_CREATE && !document) {
      return wsClient.send(
        encode({
          messageType: MessageType.ERROR,
          errorCode: DecodeError.DOES_NOT_EXIST,
          more: 0,
          description: 'does not exist'
        })
      )
    }
    if (message.creationMode === CreationMode.ALWAYS_CREATE && !document) {
      return wsClient.send(
        encode({
          messageType: MessageType.ERROR,
          errorCode: DecodeError.ALREADY_EXISTS,
          more: 0,
          description: 'already exists'
        })
      )
    }
    if (
      (message.creationMode === CreationMode.ALWAYS_CREATE ||
        message.creationMode === CreationMode.POSSIBLY_CREATE) &&
      !document
    ) {
      await WhiteboardService.createDoc(sessionId)
      if (message.data)
        await WhiteboardService.appendToDoc(sessionId, message.data)
      const docLength = await WhiteboardService.getDocLength(sessionId)
      return wsClient.send(
        encode({
          messageType: MessageType.APPEND,
          offset: docLength,
          data: '',
          more: 0
        })
      )
    }
    return wsClient.send(
      encode({
        messageType: MessageType.APPEND,
        offset: 0,
        data: document,
        more: 0
      })
    )
  },
  [MessageType.APPEND]: async ({ message, sessionId, wsClient }) => {
    const documentLength = await WhiteboardService.getDocLength(sessionId)
    if (message.offset !== documentLength) {
      return wsClient.send(
        encode({
          messageType: MessageType.ACK_NACK,
          ack: 0,
          offset: documentLength,
          more: 0
        })
      )
    }
    await WhiteboardService.appendToDoc(sessionId, message.data)
    const newDocLength = await WhiteboardService.getDocLength(sessionId)

    // Ack unless this is the beginning of a continuation
    if (!message.more) {
      wsClient.send(
        encode({
          messageType: MessageType.ACK_NACK,
          ack: 1,
          offset: newDocLength,
          more: 0
        })
      )
    }
    const packet = {
      socketId: wsClient.id,
      message: {
        messageType: MessageType.APPEND,
        offset: documentLength,
        data: message.data,
        more: message.more
      }
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
        more: 0
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
        more: 0
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
        more: 0
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
        more: 0
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
        more: 0
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
        more: 0
      })
    )
  },
  [MessageType.CONTINUATION]: async ({ message, wsClient, sessionId }) => {
    await WhiteboardService.appendToDoc(sessionId, message.data)
    const newDocLength = await WhiteboardService.getDocLength(sessionId)
    const packet = {
      socketId: wsClient.id,
      message: {
        messageType: MessageType.CONTINUATION,
        data: message.data,
        more: message.more
      }
    }
    wsEmitter.broadcast(sessionId, packet)

    // Ack if this is the end of a continuation
    if (!message.more) {
      wsClient.send(
        encode({
          messageType: MessageType.ACK_NACK,
          ack: 1,
          offset: newDocLength,
          more: 0
        })
      )
    }
  }
}

const whiteboardRouter = function(app): void {
  const router = express.Router()

  router.ws('/room/:sessionId', function(wsClient, req, next) {
    let initialized = false
    let sessionId: string

    try {
      sessionId = asStringObjectId(req.params.sessionId)
    } catch (error) {
      logger.error(error)
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
          messageType: MessageType.ERROR
        }
      }
      if (message.messageType === MessageType.INIT) initialized = true
      messageHandlers[message.messageType]
        ? messageHandlers[message.messageType]({
            message,
            sessionId,
            wsClient
          })
        : wsClient.send({ error: 'unsupported message type' })
    })

    next()
  })

  router.ws('/admin/:sessionId', function(wsClient, req) {
    const sessionId = req.params.sessionId

    wsClient.on('message', async rawMessage => {
      const message = decode(rawMessage as Uint8Array)

      if (message.messageType === MessageType.INIT) {
        // Active session's document
        let document = await WhiteboardService.getDoc(sessionId)
        // Get the completed session's whiteboard document from storage
        if (!document)
          document = await WhiteboardService.getDocFromStorage(sessionId)
        return wsClient.send(
          encode({
            messageType: MessageType.APPEND,
            offset: 0,
            data: document,
            more: 0
          })
        )
      }
    })
  })

  router.route('/reset').post(async function(req, res, next) {
    const {
      body: { sessionId }
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

module.exports = whiteboardRouter
export default whiteboardRouter
