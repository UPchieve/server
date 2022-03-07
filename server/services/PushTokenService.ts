import { messaging } from 'firebase-admin'
import { Session } from '../models/Session'
import { isEnabled } from 'unleash-client'
import Case from 'case'
import {
  FEATURE_FLAGS,
} from '../constants'

async function sendToUser(
  title: string,
  text: string,
  data: { path: string },
  tokens: string[]
) {

  let message
  if (isEnabled(FEATURE_FLAGS.NEW_MOBILE_APP)) {
    message = {
      tokens,
      data: {
        'data': 'chat',
        sessionId: data.path
      },
      notification: {
        title,
        body: text,
        sound: 'Tri-tone'
      }
    }
  } else {
    message = {
      tokens,
      apns: {
        payload: Object.assign(
          {
            data,
          },
          {
            aps: {
              alert: {
                title: title,
                body: text,
                'content-available': 1,
              },
            },
          }
        ),
      },
      android: {
        // TS says this needs to be a string,
        // of 'high' | 'normal'
        // Guessing that 1 is equivalent with 'high'
        priority: 'high',
        data: {
          title: title,
          body: text,
          message: text,
          // image: imageUrl,
          payload: JSON.stringify(data),
          'content-available': '1',
          // type: message.type,
          icon: 'notification_icon',
          color: '#16d2aa',
        },
      },
    }
  }
  return await messaging().sendMulticast(message)
}

export async function sendVolunteerJoined(
  session: Session,
  tokens: string[]
): Promise<void> {
  const { type, subTopic, _id } = session
  const title = 'We found a volunteer!'
  const text = 'Start chatting with your coach now.'
  let data
  if (isEnabled(FEATURE_FLAGS.NEW_MOBILE_APP)) {
    data = {
      path: `/session/${Case.kebab(type)}/${Case.kebab(subTopic)}/${_id}`,
    }
  } else {
    data = {
      path: _id
    }
  }

  await sendToUser(title, text, data, tokens)
}
