import { messaging } from 'firebase-admin'
import Case from 'case'
import { isDevEnvironment } from '../utils/environments'

async function sendToUser(
  title: string,
  text: string,
  data: { path: string },
  tokens: string[]
) {
  // prevent errors in local dev when we are not testing firebase
  if (isDevEnvironment() && !process.env.SUBWAY_FIREBASE_PROJECT_ID) {
    return
  }

  return await messaging().sendEachForMulticast({
    tokens, // can also send to a topic (group of people)
    // ios and android process data a little differently, so setup separate objects for each
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
  })
}

export async function sendVolunteerJoined(
  sessionId: string,
  topic: string,
  subject: string,
  tokens: string[]
): Promise<void> {
  const title = 'We found a volunteer!'
  const text = 'Start chatting with your coach now.'
  const data = {
    path: `/session/${Case.kebab(topic)}/${Case.kebab(subject)}/${sessionId}`,
  }

  await sendToUser(title, text, data, tokens)
}
