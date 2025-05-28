import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as ModerationService from '../../services/ModerationService'
import * as WhiteboardService from '../../services/WhiteboardService'
import config from '../../config'
import { importFromStringSync } from 'module-from-string'
import { get } from 'node:https'
import logger from '../../logger'

export function fetchRemoteJs(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data)).on('error', (err) => reject(err))
    })
  })
}

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function moderateSessionTranscript(
  job: Job<ModerateSessionTranscriptJobData>
) {
  const ZwibblerString = await fetchRemoteJs(config.zwibblerNodeUrl)

  logger.warn(`1. zwibbler imported string, ${ZwibblerString}`)

  // NOTE: we're grabbing the Zwibbler node library from our CDN
  // we don't want to keep it in the repo for licensing reasons
  // WARNING: DO NOT use 'module-from-string' for code we don't control since it
  // doesn't go through the same CVE checks that node modules do
  const ZwibblerLib = importFromStringSync(ZwibblerString, {
    globals: { setTimeout: setTimeout },
  })

  logger.warn(`2. zwibbler imported lib, ${ZwibblerLib}`)

  try {
    const transcript = await SessionService.getSessionTranscript(
      job.data.sessionId
    )

    logger.warn(`3. transcript, ${transcript}`)
    const whiteboardDoc = await WhiteboardService.getDocFromStorage(
      job.data.sessionId
    )

    let extractedText = undefined
    let moderatedWhiteboardResults = undefined
    if (whiteboardDoc.length > 0 || true) {
      logger.warn(`4. whiteboardDoc`, whiteboardDoc)
      const tmp = `B0:gps:mb86eq6s;Cxbzsdw;0:1/gps1;20;{"$type":"PageNode"};B1:gps:mb86eqyz;S0;30;{"useInfiniteWhiteboard":true};B2:gps:mb86euws;Crbhjkn;xbzsdw:1/gps2;686;{"points":[180,324,156.75,318.28125,142.5,311.921875,125.984375,300,119.234375,293.78125,112.138671875,285.49609375,105.1875,274.03125,103.421875,268.40625,102.21875,259.03125,103.640625,244.78125,110.578125,229.234375,116.642578125,219.888671875,125.078125,209.59765625,132.96875,202.078125,143.25,194.796875,152,190.65625,162.49609375,187.708984375,174.28125,186.21875,184.8359375,186.8203125,190.421875,188.67578125,196.671875,192.5625,201.92578125,197.89453125,209.111328125,208.322265625,214.0703125,218.46875,219.671875,233.671875,221.53125,241.765625,219.671875,233.671875,221.53125,241.765625,222,251],"layer":"default","lineWidth":5,"strokeStyle":"#000000","$type":"BrushNode"};B3:gps:mb86f7v6;C3gra2o;xbzsdw:2/gps3;280;{"text":"sammy.nave@upchieve.org\n","background":"transparent","fontSize":32,"fontName":"Arial","bold":false,"italic":false,"textAlign":"left","textFillStyle":"#000000","textDecoration":"none","strokeStyle":"#000000","lineWidth":0,"layer":"default","wrap":true,"$type":"TextNode"};S3gra2o;40;{"matrix":"matrix(1, 0, 0, 1, 92, 146)"};B4:gps:mb86feo0;S3gra2o;39;{"matrix":"matrix(1, 0, 0, 1, 9, 120)"};B5:8aj:mb86hlky;S0;30;{"useInfiniteWhiteboard":true};B6:D9H:mb86hlqy;S0;30;{"useInfiniteWhiteboard":true};B7:8aj:mb86ho3f;Cqcefwe;xbzsdw:4/8aj1;412;{"points":[59.078241604477626,755.1585820895523,66.78022606693098,802.6592671408582,67.14844843166978,818.2780324451959,68.76325692703476,832.8650079983386,69.11230104361007,851.8783232276121,70.82300077979245,870.949173201376,70.53916270697296,896.2337755801074,69.21969923332556,896.2337755801074,68.89750466417911,894.5921175373135],"layer":"default","lineWidth":5,"strokeStyle":"#000000","$type":"BrushNode"};B8:8aj:mb86hwsr;Cbrzm8x;xbzsdw:6/8aj2;457;{"points":[151.37931436567163,613.7611940298508,122.00590947848649,619.6412449167735,8.04875889109142,619.6374092671409,-11.359628250349807,618.8395941435402,-28.62005159748134,616.3847783786148,-38.10177748950559,613.2548882783349,-54.8252098880597,603.8652179774955,-49.578041190531714,607.2252470557369,-60.07237858558768,600.0142257462687,-68.57217817164178,592.1588152985075],"layer":"default","lineWidth":5,"strokeStyle":"#000000","$type":"BrushNode"};B9:8aj:mb86id9i;Cela6ze;xbzsdw:8/8aj3;305;{"points":[371.33080690298505,876.9174440298508,374.6141229885727,854.287111196945,376.6393459946362,831.1044448169309,402.5069671175374,760.0375284223416,406.46535753847957,752.9492479011194,406.6801539179105,747.3031716417911],"layer":"default","lineWidth":5,"strokeStyle":"#000000","$type":"BrushNode"};Ba:8aj:mb86spqz;C3iybl6;xbzsdw:9/8aj4;341;{"points":[309.826544944189,388.6258510996297,315.8065594060812,374.87692896074907,314.8450293029672,357.096608183563,314.8450293029672,325.8740326757985,317.82545317740386,284.8956002414212,317.736008516649,286.39060385689424,318.00434249891345,272.5011258225419],"layer":"default","lineWidth":5,"strokeStyle":"#000000","$type":"BrushNode"};Bb:8aj:mb86sq5t;Cys6pxj;xbzsdw:a/8aj5;344;{"points":[270.5731166815114,315.02567310710924,278.7509142362359,299.206745962189,299.7065204702174,263.1349920606465,311.XXXXXXXXXXXXX,235.98214861722533,312.57377381022917,236.12589896486696,316.669061491931,242.24646932223104,332.7243780974175,269.23000680065206],"layer":"default","lineWidth":5,"strokeStyle":"#000000","$type":"BrushNode"}`
      logger.warn(`tmp`, tmp)
      let whiteboardImage = null
      try {
        whiteboardImage = await ZwibblerLib.Zwibbler.save(whiteboardDoc, 'jpeg')
      } catch {
        logger.warn(
          `Failed to create image from whiteboard for session ${job.data.sessionId}`
        )
      }

      logger.warn(`4.5. whiteboardImage, ${whiteboardImage}`)
      if (whiteboardImage) {
        const imageBuffer = Buffer.from(whiteboardImage, 'binary')
        logger.warn(`4.75 image buffer ${imageBuffer}`)
        moderatedWhiteboardResults = await ModerationService.moderateImage({
          image: imageBuffer,
          sessionId: job.data.sessionId,
          userId: '',
          isVolunteer: false,
          source: 'whiteboard',
          aggregateInfractions: true,
          recordInfractions: false,
        })

        logger.warn(
          `5. moderatedWhiteboardResults, ${moderatedWhiteboardResults}`
        )

        if (moderatedWhiteboardResults?.failures.length) {
          logger.warn(
            `6. saving whiteboard image to bucket, ${whiteboardImage}`
          )
          await ModerationService.saveImageToBucket({
            sessionId: job.data.sessionId,
            image: Buffer.from(whiteboardImage, 'binary'),
            source: 'whiteboard',
          })
        }

        extractedText = await ModerationService.extractTextFromImage(
          Buffer.from(whiteboardImage, 'binary')
        )
      }
    }

    logger.warn(`7. extractedText, ${extractedText?.join(' | ')}`)

    const moderationResults = await ModerationService.moderateTranscript(
      transcript,
      extractedText
    )

    logger.warn(`8. moderationResults, ${moderationResults}`)

    const combinedResults = [
      ...moderationResults.reasons,
      ...(moderatedWhiteboardResults?.failures ?? []),
    ]

    logger.warn(`9. combinedResults, ${combinedResults}`)

    if (combinedResults.length) {
      logger.warn('10. getting session flags')
      const sessionFlags = combinedResults.map((r) =>
        ModerationService.getSessionFlagByModerationReason(r)
      )

      logger.warn(`11. marking session for review, ${sessionFlags}`)
      await ModerationService.markSessionForReview(
        job.data.sessionId,
        sessionFlags
      )
    }
  } catch (err) {
    throw new Error(
      `Failed to moderate transcript for session ${job.data.sessionId}. Error: ${err}`
    )
  }
}
