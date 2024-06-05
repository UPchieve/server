import logger from '../logger'
import {
  CensoredSessionMessage,
  CENSORED_BY,
  createCensoredMessage,
} from '../models/CensoredSessionMessage'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { openai } from './BotsService'
import {
  AI_MODERATION_STATE,
  getAiModerationFeatureFlag,
} from './FeatureFlagService'
import { timeLimit } from '../utils/time-limit'
export interface ModerateMessageOptions {
  content: string
}
// EMAIL_REGEX checks for standard and complex email formats
// Ex: yay-hoo@yahoo.hello.com
const EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi

// PHONE_REGEX checks for 7/10 digit phone numbers with/out punctuation, not surrounded by other numbers
const PHONE_REGEX = /([^\d]|^)(\+\d{1,2}\s)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}([^\d]|$)/g

// PROFANITY_REGEX - Google's list of common bad words
const PROFANITY_REGEX = /\b(4r5e|5h1t|5hit|a55s|ass-fucker|assfucker|assfukka|a_s_s|b!tch|b00bs|b17ch|b1tch|ballsack|beastial|beastiality|bestiality|blow job|blowjob|blowjobs|boiolas|booooooobs|bunny fucker|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|clitoris|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cokmuncher|coksucka|cumshot|cunilingus|cunillingus|cunnilingus|cuntlick|cuntlicker|cuntlicking|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|dog-fucker|donkeyribber|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fagging|faggitt|faggot|faggs|fagot|fagots|fannyflaps|fannyfucker|fatass|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|fuck|fucka|fucked|fucker|fuckers|kghckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fukker|fukkin|fukwhit|fukwit|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|goatse|hardcoresex|horniest|horny|hotsex|jack-off|jackoff|jerk-off|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat|masterbat3|masterbate|masterbation|masterbations|masturbate|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muthafecker|muthafuckker|mutherfucker|n1gga|n1gger|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob jokey|nobjocky|nobjokey|nutsack|p0rn|pecker|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|pissflaps|schlong|smegma|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tw4t|twathead|twatty|twunt|twunter|v14gra|v1gra|w00se|a55|a55hole|aeolus|ahole|anal|analprobe|anilingus|arian|aryan|ass|assbang|assbanged|assbangs|asses|assfuck|assfucker|assh0le|asshat|assho1e|ass hole|assholes|assmaster|assmunch|asswipe|asswipes|azazel|azz|b1tch|babe|babes|ballsack|bastard|bastards|beaner|beardedclam|beastiality|beatch|beeyotch|beotch|biatch|bigtits|big tits|bimbo|bitch|bitched|bitches|bitchy|blow job|blowjob|blowjobs|boink|bollock|bollocks|bollok|boner|boners|bong|boob|boobies|boobs|booby|booger|bookie|bootee|booty|boozer|boozy|bosomy|brassiere|bugger|bullshit|bull shit|bullshits|bullshitted|bullturds|bung|busty|butt fuck|buttfuck|buttfucker|buttfucker|buttplug|c.0.c.k|c.o.c.k.|c.u.n.t|c0ck|c-0-c-k|caca|cahone|cameltoe|carpetmuncher|cawk|chinc|chincs|chode|chodes|cl1t|clit|clitoris|clitorus|clits|clitty|cocain|cock|c-o-c-k|cockblock|cockholster|cockknocker|cocks|cocksmoker|cocksucker|cock sucker|coital|commie|condom|coon|coons|corksucker|crackwhore|crap|crappy|cum|cummin|cumming|cumshot|cumshots|cumslut|cumstain|cunilingus|cunnilingus|cunny|cunt|cunt|c-u-n-t|cuntface|cunthunter|cuntlick|cuntlicker|cunts|d0ng|d0uch3|d0uche|d1ck|d1ld0|d1ldo|dago|dagos|dawgie-style|dick|dickbag|dickdipper|dickface|dickflipper|dickhead|dickheads|dickish|dick-ish|dickripper|dicksipper|dickweed|dickwhipper|dickzipper|dike|dildo|dildos|diligaf|dillweed|dimwit|dingle|dipship|doggie-style|doggy-style|dong|doofus|doosh|dopey|douch3|douche|douchebag|douchebags|douchey|dumass|dumbass|dumbasses|dyke|dykes|ejaculate|erect|erection|erotic|essohbee|extacy|extasy|f.u.c.k|fack|fag|fagg|fagged|faggit|faggot|fagot|fags|faig|faigt|fannybandit|fartknocker|felch|felcher|felching|fellate|fellatio|feltch|feltcher|fisted|fisting|fisty|foad|fondle|foreskin|freex|frigg|frigga|fubar|fuck|f-u-c-k|fuckass|fucked|fucked|fucker|fuckface|fuckin|fucking|fucknugget|fucknut|fuckoff|fucks|fucktard|fuck-tard|fuckup|fuckwad|fuckwit|fudgepacker|fuk|fvck|fxck|gae|gai|ganja|gfy|ghay|ghey|gigolo|glans|goatse|goldenshowers|gook|gooks|gspot|g-spot|gtfo|guido|h0m0|h0mo|handjob|hard on|he11|hebe|heeb|herp|herpy|hobag|hom0|homey|homoey|honky|hooch|hookah|hooker|hoor|hootch|hooter|hooters|horny|hump|humped|humping|hussy|hymen|injun|j3rk0ff|jackass|jackhole|jackoff|jap|japs|jerk|jerk0ff|jerked|jerkoff|jism|jiz|jizm|jizz|jizzed|junkie|junky|kike|kikes|kinky|kkk|klan|knobend|kooch|kooches|kootch|kraut|kyke|labia|lech|leper|lesbo|lesbos|lez|lezbo|lezbos|lezzie|lezzies|lezzy|loin|loins|lube|lusty|mams|massa|masterbate|masterbating|masterbation|masturbate|masturbating|masturbation|m-fucking|mofo|molest|moolie|moron|motherfucka|motherfucker|motherfucking|mtherfucker|mthrfucker|mthrfucking|muff|muffdiver|murder|muthafuckaz|muthafucker|mutherfucker|mutherfucking|muthrfucking|nad|nads|napalmsm|negro|nigga|niggah|niggas|niggaz|nigger|nigger|niggers|niggle|niglet|nimrod|ninny|nooky|nympho|orgasmic|orgies|orgy|p.u.s.s.y.|paddy|paki|pantie|panties|panty|pastie|pasty|pcp|pecker|pedo|pedophile|pedophilia|pedophiliac|peepee|penial|penile|phuck|pillowbiter|pinko|pissoff|piss-off|pms|polack|pollock|poon|poontang|porn|porno|pornography|prick|prig|prostitute|prude|pube|pubic|punkass|punky|puss|pussies|pussy|pussypounder|puto|queaf|queef|queef|queero|quicky|quim|rape|raped|raper|rapist|reefer|reetard|reich|retard|retarded|rimjob|ritard|rtard|r-tard|rump|rumprammer|ruski|s.h.i.t.|s.o.b.|s0b|sadism|sadist|scag|schizo|schlong|scrog|scrot|scrote|scrud|sh1t|s-h-1-t|shamedame|shit|s-h-i-t|shite|shiteater|shitface|shithead|shithole|shithouse|shits|shitt|shitted|shitter|shitty|shiz|sissy|skag|skank|slut|slutdumper|slutkiss|sluts|smegma|smut|smutty|s-o-b|sodom|souse|soused|spic|spick|spik|spiks|spooge|spunk|stfu|stiffy|sumofabiatch|t1t|tard|tawdry|teabagging|teat|terd|thug|tit|titfuck|titi|tits|tittiefucker|titties|titty|tittyfuck|tittyfucker|toke|toots|tramp|transsexual|tubgirl|turd|tush|twat|twats|undies|unwed|uzi|vag|valium|viagra|voyeur|wang|wank|wanker|wetback|wh0re|wh0reface|whitey|whoralicious|whore|whorealicious|whored|whoreface|whorehopper|whorehouse|whores|whoring|wigger|wtf|yobbo|zoophile)\b/gi

// Restrict access to have sessions on third party platforms
const SAFETY_RESTRICTION_REGEX = /\b(zoom.us|meet.google.com)\b/gi

export async function createChatCompletion({
  censoredSessionMessage,
  isVolunteer,
}: {
  censoredSessionMessage: CensoredSessionMessage
  isVolunteer: boolean
}) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: MODERATION_PROMPT,
        },
        {
          role: 'user',
          content: wrapMessageInXmlTags(
            censoredSessionMessage.message,
            isVolunteer
          ),
        },
      ],
      response_format: { type: 'json_object' },
    })

    const decision = JSON.parse(chatCompletion.choices[0].message.content || '')
    const logData = {
      censoredSessionMessage,
      decision: {
        isClean: decision.appropriate,
        reasons: decision.reasons,
        moderatorVersion: MODERATION_VERSION,
      },
    }
    logger.info(logData, 'AI moderation result')
    return decision
  } catch (err) {
    logger.error(
      {
        error: err,
        censoredSessionMessageId: censoredSessionMessage.id,
      },
      `Error while moderating session message`
    )
  }
}

async function createChatCompletionJob({
  censoredSessionMessage,
  isVolunteer,
}: {
  censoredSessionMessage: CensoredSessionMessage
  isVolunteer: boolean
}) {
  try {
    await QueueService.add(
      Jobs.ModerateSessionMessage,
      {
        censoredSessionMessage,
        isVolunteer,
      },
      { removeOnComplete: true, removeOnFail: true }
    )
  } catch (err) {
    logger.error(
      censoredSessionMessage,
      `Failed to enqueue job ${Jobs.ModerateSessionMessage}`
    )
  }
}

function test({ regex, message }: { regex: RegExp; message: string }) {
  const results: string[] = []
  for (const [match] of message.matchAll(regex)) {
    results.push(match)
  }
  return results
}

function formatAiResponse(response: {
  message: string
  appropriate: boolean
  reasons: string[]
}) {
  return response.appropriate ? {} : response.reasons
}

// Returns whether message is clean
export async function moderateMessage({
  message,
  senderId,
  isVolunteer,
  sessionId,
}: {
  message: string
  senderId: string
  isVolunteer: boolean
  sessionId?: string
}): Promise<boolean | { failures: Record<string, string[] | never> }> {
  const failedTests = [
    ['email', test({ regex: EMAIL_REGEX, message })],
    ['phone', test({ regex: PHONE_REGEX, message })],
    ['profanity', test({ regex: PROFANITY_REGEX, message })],
    ['safety', test({ regex: SAFETY_RESTRICTION_REGEX, message })],
  ].filter(([, test]) => test.length > 0)
  const isClean = failedTests.length === 0

  /*
   * Old high-line mid town clients will not send up sessionId
   * return `true` or `false` for them
   */
  if (!sessionId) {
    return isClean
  }

  /*
   * New clients can recieve a reasons why the message was rejected
   * @example: {
   *   failures: {
   *     email: [ 's@n.com' ],
   *     phone: [ ' 6152656652.' ],
   *     profanity: [ 'toke' ],
   *     safety: [ 'zoom.us', 'meet.google.com' ]
   *   }
   * }
   */
  let result = { failures: Object.fromEntries(failedTests) }
  if (!isClean) {
    const censoredSessionMessage = await createCensoredMessage({
      senderId,
      message,
      sessionId,
      censoredBy: CENSORED_BY.regex,
    })

    const userTargetStatus = await getAiModerationFeatureFlag(senderId)
    if (userTargetStatus === AI_MODERATION_STATE.targeted) {
      const response = await timeLimit({
        promise: createChatCompletion({
          censoredSessionMessage,
          isVolunteer,
        }),
        fallbackReturnValue: null,
        timeLimitReachedErrorMessage:
          'AI Moderation time limit reached. Returning regex value',
        waitInMs: 3000,
      })
      result.failures =
        response === null ? result.failures : formatAiResponse(response)
    } else if (userTargetStatus === AI_MODERATION_STATE.notTargeted) {
      await createChatCompletionJob({ censoredSessionMessage, isVolunteer })
    }

    logger.info(
      { censoredSessionMessage, reasons: result },
      'Session message was censored'
    )
  }

  return result
}

/**
 * Enclose the given message in <student></student> or <tutor></tutor> tags.
 */
export const wrapMessageInXmlTags = (
  message: string,
  isVolunteer: boolean
): string => {
  const xmlTag = isVolunteer ? 'tutor' : 'student'
  return `<${xmlTag}>${message}</${xmlTag}>`
}

export const MODERATION_VERSION = 'openai_v2'
export const MODERATION_PROMPT = `
You are moderating a chat room conversation between a student and an adult tutor. You are responsible for flagging inappropriate messages. Messages are delimited by XML tags, either <student> for messages sent by the the student or <tutor> for messages sent by the adult tutor.

When flagging a message, consider just the message in the XML tag.

Exceptions to what are considered harmful are delimited by the XML tag <exceptions>. Messages that meet the exception criteria should not be flagged.

For each message provided, please provide a JSON array response where the form of each element is delimited by triple quotes:

"""
{

  message: string,

  appropriate: boolean,

  reasons: Map<reason, offendingSubstring[]>

}
"""

where 'message' is the message provided between XML tags, 'appropriate' is a decision on if the message is appropriate, and 'reasons' is a map that associates each inappropriate substring with their reason.

Acceptable values for the elements of the 'reasons' array are:
- "profanity" - Use this reason when the message is inappropriate due to profanity.
- "hateful_language" - Use this reason when the message is inappropriate due to hateful language.
- "email" - Use this reason when the message is inappropriate because it includes an email address
- "phone" - Use this reason when the message is inappropriate because it includes a phone number
- "other_contact_info" - Use this reason when the message is inappropriate because it includes other forms of contact information, such as social media handles, hints to a participant's physical location, etc
- "safety" - Use this reason when the message is inappropriate because it includes plans for the chat participants to communicate outside of this platform, or indicates other potential for harm.
- "other" - Use this reason as a catch-all for anything else you think is inappropriate for an adult to share with a minor or vice-a-versa


<exceptions>
- Links to common text-based collaboration tools (like Google Docs) that are shared for the purpose of reviewing school assignments
- Direct quotes from literature
- Profanity that is likely just a typo. In this event, prefer flagging the message as appropriate instead of inappropriate if and only if the context of the message indicates it was likely a mistake.
</exceptions>`
