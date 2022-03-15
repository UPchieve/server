import { messaging } from 'firebase-admin'
import { Session } from '../models/Session'
import { isEnabled } from 'unleash-client'
import Case from 'case'
import { FEATURE_FLAGS } from '../constants'
import MulticastMessage = messaging.MulticastMessage

async function sendToUser(
  title: string,
  text: string,
  data: { path: string },
  tokens: string[]
) {
  let message: MulticastMessage
  if (isEnabled(FEATURE_FLAGS.NEW_MOBILE_APP)) {
    message = {
      tokens,
      data: {
        data: 'chat',
        sessionId: data.path,
      },
      notification: {
        title,
        body: text,
      },
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
              },
            },
          }
        ),
      },
      android: {
        data: {
          title: title,
          body: text,
          message: text,
          // image: imageUrl,
          payload: JSON.stringify(data),
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
      path: _id.toString(),
    }
  }

  await sendToUser(title, text, data, tokens)
}
