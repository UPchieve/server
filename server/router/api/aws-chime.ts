import { Router } from 'express'
import { extractUser } from '../extract-user'
import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import { resError } from '../res-error'

export function routeAwsChime(router: Router): void {
  router.post('/chime/meeting', async (req, res) => {
    try {
      const user = extractUser(req)
      const chime = new AWS.ChimeSDKMeetings({ region: 'us-east-1' })

      // @TODO move to server layer, etc
      const createMeetingResponse = await chime
        .createMeeting({
          ClientRequestToken: uuidv4(),
          MediaRegion: 'us-east-1', // this is ideallyg the region closest to the user creating the meeting
          ExternalMeetingId: 'meeting-1',
        })
        .promise()

      const createAttendeeResponse = await chime
        .createAttendee({
          MeetingId: createMeetingResponse.Meeting?.MeetingId,
          ExternalUserId: user.id,
        })
        .promise()

      console.debug(
        'Created meeting and attendee',
        JSON.stringify(
          {
            meeting: createMeetingResponse,
            attendee: createAttendeeResponse,
          },
          null,
          2
        )
      )

      return res
        .json({
          meeting: createMeetingResponse,
          attendee: createAttendeeResponse,
        })
        .status(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.delete('/chime/meeting/:meetingId', async (req, res) => {
    try {
      const meetingId = req.params.meetingId
      console.debug(`Deleting meeting with ID ${meetingId}`)
      const chime = new AWS.ChimeSDKMeetings({ region: 'us-east-1' })

      const response = await chime
        .deleteMeeting({
          MeetingId: meetingId,
        })
        .promise()

      console.debug('Deleted meeting', response)
      return res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })
}
