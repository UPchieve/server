import { find, chain, cloneDeep } from 'lodash'
import { Ulid } from '../models/pgUtils'
import { getUsingOurPlatformFlag } from '../services/FeatureFlagService'

export interface TrainingCourse {
  name: string
  courseKey: string
  description: string
  quizKey: string
  quizName: string
  modules: TrainingModule[]
}

interface TrainingModule {
  name: string
  materials: TrainingMaterial[]
}

enum MaterialType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  LINK = 'link',
  RESOURCES = 'resources',
}

interface TrainingMaterial {
  name: string
  description?: string
  materialKey: string
  isRequired: boolean
  type: MaterialType
  // the ID Vimeo gives a video when uploaded
  resourceId?: string
  linkUrl?: string
  links?: TrainingMaterialLink[]
  videoPDF?: string
  linkLabel?: string
}

interface TrainingMaterialLink {
  displayName: string
  url: string
}

/**
 *
 * Keeping for historical purposes to be able to tell which
 * materialKey belongs to a particular training.
 * This will be useful for when we migrate the training
 * course materials into the database
 *
 */
export const legacyCourses: TrainingCourse[] = [
  {
    name: 'UPchieve 101',
    courseKey: 'upchieve101',
    description: `UPchieve101 will teach you everything you need to know to start helping students achieve their academic goals! You'll need to pass a short quiz at the end in order to be ready to coach.`,
    quizKey: 'upchieve101',
    quizName: 'UPchieve 101 Quiz',
    modules: [
      {
        name: 'Intro to UPchieve',
        materials: [
          {
            name: 'Welcome to UPchieve!',
            materialKey: '31rgp3',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '459021055',
          },
          {
            name: 'Join the UPchieve Slack Community',
            materialKey: '1s3654',
            type: MaterialType.LINK,
            isRequired: false,
            linkUrl:
              'https://join.slack.com/t/upchieveaccommunity/shared_invite/zt-1gihzt03n-Sj58fEdBiZjVwc4DPDdg0g',
          },
          {
            name: "Register for UPchieve's Monthly Coach Meetings",
            materialKey: '42j392',
            type: MaterialType.LINK,
            isRequired: false,
            linkUrl:
              'https://us02web.zoom.us/meeting/register/uZUsduiqrzgiO4_zJG9YvVJcx8vBxt4snA',
          },
          {
            name: 'Additional Resources',
            description:
              'This is a set of articles we recommend reading that can help deepen your understanding of why a platform like UPchieve is so important to low-income students.',
            materialKey: '90d731',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Upchieve Student Testimonials and Feedback',
                url:
                  'https://cdn.upchieve.org/training-courses/upchieve101/student-testimonials-and-feedback.pdf',
              },
              {
                displayName: 'Overview of Inequity in Higher Education',
                url:
                  'http://pellinstitute.org/downloads/publications-Indicators_of_Higher_Education_Equity_in_the_US_2018_Historical_Trend_Report.pdf',
              },
              {
                displayName: "Overview of Covid-19's Impact on Education",
                url:
                  'https://www.mckinsey.com/industries/public-and-social-sector/our-insights/covid-19-and-student-learning-in-the-united-states-the-hurt-could-last-a-lifetime',
              },
            ],
          },
        ],
      },
      {
        name: 'Becoming an Active Coach',
        materials: [
          {
            name: 'Getting Approved and Onboarded',
            materialKey: '412g45',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '458744762',
          },
          {
            name: 'Guide to Choosing Your References',
            materialKey: 'vrwv5g',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/choosing-references.pdf',
          },
          {
            name: 'Additional Resources',
            materialKey: '1hh701',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Approval Process Demo',
                url: 'https://vimeo.com/451872809',
              },
              {
                displayName: 'Onboarding Process Demo',
                url: 'https://vimeo.com/451872896',
              },
            ],
          },
        ],
      },
      {
        name: 'Helping Your First Student',
        materials: [
          {
            name: 'Fulfilling Student Requests',
            materialKey: '212h45',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '458744827',
          },
          {
            name: 'Additional Resources',
            materialKey: 'g0g710',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Tutoring Session Demo',
                url: 'https://vimeo.com/457909355',
              },
              {
                displayName: 'College Counseling Session Demo',
                url: 'https://vimeo.com/457909309',
              },
            ],
          },
        ],
      },
      {
        name: 'Student Safety',
        materials: [
          {
            name: 'Keeping Students Safe',
            materialKey: '839fi9',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '458744863',
          },
          {
            name: 'UPchieve Student Safety Policy',
            materialKey: 'ps87f9',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/student-safety-policy.pdf',
          },
          {
            name: 'Guide to Personal Questions',
            materialKey: 'c8cjre',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/personal-questions.pdf',
          },
        ],
      },
      {
        name: 'Academic Integrity',
        materials: [
          {
            name: 'Maintaining Academic Integrity',
            materialKey: 'jgu55k',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '459021109',
          },
          {
            name: 'UPchieve Academic Integrity Policy',
            materialKey: '3gh7dh',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/academic-integrity-v1.pdf',
          },
          {
            name: 'Examples of Cheating',
            materialKey: '1w5fp0',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/cheating-examples.pdf',
          },
        ],
      },
      {
        name: 'Diversity, Equity, and Inclusion',
        materials: [
          {
            name: 'Incorporating DEI Into Your Coaching',
            materialKey: 'chduq3',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '459021056',
          },
          {
            name: 'UPchieve DEI Policy',
            materialKey: 'fj8tzq',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/dei-policy.pdf',
          },
          {
            name: 'Complete Implicit Bias Training',
            description:
              'The Kirwan Institute for the Study of Ethnicity and Race at The Ohio State University has a 4-part module series about implicit bias and its impact on students. Please complete at least Modules 1 and 2 for this training.',
            materialKey: 'k3k37t',
            type: MaterialType.LINK,
            isRequired: true,
            linkUrl: 'http://kirwaninstitute.osu.edu/implicit-bias-training/',
          },
          {
            name: 'Take the Race IAT',
            materialKey: 'sk8lyf',
            type: MaterialType.LINK,
            isRequired: true,
            linkUrl: 'https://implicit.harvard.edu/implicit/selectatest.html',
          },
          {
            name: 'Additional Resources',
            description:
              'The following resources are all optional, but we highly encourage you to go through them and learn as much as you can. These are important considerations to have during our day-to-day interactions, not just during a tutoring session!',
            materialKey: 'g34kfx',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Examples of Microaggressions',
                url: 'https://sph.umn.edu/site/docs/hewg/microaggressions.pdf',
              },
              {
                displayName:
                  "Examples of How Implicit Bias Can Influence Educators' Behavior",
                url: 'https://poorvucenter.yale.edu/ImplicitBiasAwareness',
              },
              {
                displayName: 'Podcast on Desegregation',
                url:
                  'https://www.thisamericanlife.org/562/the-problem-we-all-live-with-part-one',
              },
            ],
          },
        ],
      },
      {
        name: 'Worst Case Scenarios',
        materials: [
          {
            name: 'Handling Worst Case Scenarios',
            materialKey: 'xgvd64',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '458744858',
          },
          {
            name: 'Guidelines for Reporting a Student',
            materialKey: '1axg8b',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/reporting-guidelines.pdf',
          },
          {
            name: 'More Tips on Handling Challenging Scenarios',
            materialKey: 'jkkm20',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/challenging-scenarios.pdf',
          },
        ],
      },
    ],
  },
]

/**
 *
 * Keeping for historical purposes to be able to tell which
 * materialKey belongs to a particular training.
 * This will be useful for when we migrate the training
 * course materials into the database
 *
 */
export const legacyCoursesv2: TrainingCourse[] = [
  {
    name: 'UPchieve 101',
    courseKey: 'upchieve101',
    description: `UPchieve101 will teach you everything you need to know to start helping students achieve their academic goals! You'll need to pass a short quiz at the end in order to be ready to coach.`,
    quizKey: 'upchieve101',
    quizName: 'UPchieve 101 Quiz',
    modules: [
      {
        name: 'Intro to UPchieve',
        materials: [
          {
            name: 'Welcome to UPchieve!',
            materialKey: '31rgp3',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '459021055',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/introduction-to-upchieve-deck.pdf',
          },
          {
            name: 'Meet an UPchieve Student',
            materialKey: '928nd1',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '772586596',
          },
          {
            name: 'Join the UPchieve Slack Community',
            description:
              'Join our Coach Slack Community to connect with other coaches, learn about best-practices, and meet our amazing team of equity-oriented volunteers!',
            materialKey: '1s3654',
            type: MaterialType.LINK,
            isRequired: false,
            linkUrl:
              'https://join.slack.com/t/upchieveaccommunity/shared_invite/zt-1gihzt03n-Sj58fEdBiZjVwc4DPDdg0g',
          },
          {
            name: 'Additional Resources',
            description:
              'This is a set of articles we recommend reading that can help deepen your understanding of why a platform like UPchieve is so important to low-income students.',
            materialKey: '90d731',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName:
                  'Get Ready to Make a Difference: What Our Students Say',
                url:
                  'https://cdn.upchieve.org/training-courses/upchieve101/what-our-students-have-to-say.pdf',
              },
              {
                displayName: 'Overview of Inequity in Higher Education',
                url:
                  'http://pellinstitute.org/downloads/publications-Indicators_of_Higher_Education_Equity_in_the_US_2018_Historical_Trend_Report.pdf',
              },
              {
                displayName: "Overview of Covid-19's Impact on Education",
                url:
                  'https://www.mckinsey.com/industries/public-and-social-sector/our-insights/covid-19-and-student-learning-in-the-united-states-the-hurt-could-last-a-lifetime',
              },
            ],
          },
        ],
      },
      {
        name: 'Becoming a Great Coach',
        materials: [
          {
            name: 'Using Our Platform',
            materialKey: '212h45',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '797113791',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/using-our-platform-deck.pdf',
          },
          {
            name: 'Implementing Effective Coaching Strategies',
            materialKey: '7b6a76',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '760386859',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/implementing-effective-coaching-strategies-deck.pdf',
          },
          {
            name: 'Coaching Strategies Review',
            materialKey: 'io38j2',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-coaching-strategies.pdf',
          },
          {
            name: 'Responding to Tricky Coaching Situations',
            materialKey: 'h3hi92',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '762040321',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/responding-to-tricky-coaching-situations-deck.pdf',
          },
          {
            name: 'Getting Familiar With the Platform',
            materialKey: 'odn930',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName:
                  'FAQ About the Process of Becoming an UPchieve Coach',
                url: 'https://upchieve.org/becoming-an-active-coach-faq',
              },
              // TODO: video is not finished yet. Add URL to video once completed
              // {
              //   displayName: 'Watch an Academic Coaching Session Demo',
              //   url: '',
              // },
              {
                displayName: 'Watch a College Coaching Session Demo',
                url: 'https://vimeo.com/457909309',
              },
              {
                displayName: 'Watch a Real Session',
                url: 'https://www.youtube.com/watch?v=GnkLY2jpjcc',
              },
            ],
          },
          {
            name: 'Test Out the Platform',
            materialKey: 'snd129',
            type: MaterialType.LINK,
            isRequired: false,
            description:
              'Want to try out our platform as a student? Play around with our whiteboard or doc editor without picking up a request using our demo site!\n\nusername: volunteers@upchieve.org\npassword: volunteeronboarding!',
            linkUrl: 'https://demo.upchieve.org',
            linkLabel: 'Go to demo site',
          },
          {
            name: 'Practice More Coaching Strategies',
            materialKey: 'nsj732',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Learning What Students Know',
                url:
                  'https://docs.google.com/forms/d/1NotpEz8-vBDfWP0O0ejuLehTAaUp6cNoJHGxYMx4jF8/viewform?edit_requested=true',
              },
              {
                displayName: 'Giving Effective Praise',
                url:
                  'https://docs.google.com/forms/d/1XRt5QldoD_-LURjiE7VOxqBvNAjgj2ARenQa15jk5g4/viewform?edit_requested=true',
              },
              {
                displayName: 'Responding to Student Errors',
                url:
                  'https://docs.google.com/forms/d/e/1FAIpQLSfM48ah4KLpuoYEBVisvQ5s6LUgQjt01F2epdym_kuN6tfjQQ/viewform',
              },
            ],
          },
        ],
      },
      {
        name: 'Diversity, Equity, and Inclusion',
        materials: [
          {
            name: 'Incorporating DEI Into Your Coaching',
            materialKey: 'chduq3',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '459021056',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/dei-deck.pdf',
          },
          {
            name: 'UPchieve DEI Policy',
            materialKey: 'fj8tzq',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/dei-policy.pdf',
          },
          {
            name: 'Complete Implicit Bias Training',
            description:
              'The Kirwan Institute for the Study of Ethnicity and Race at The Ohio State University has a 4-part module series about implicit bias and its impact on students. Please complete at least Modules 1 and 2 for this training.',
            materialKey: 'k3k37t',
            type: MaterialType.LINK,
            isRequired: true,
            linkUrl: 'http://kirwaninstitute.osu.edu/implicit-bias-training/',
          },
          {
            name: 'Take the Race IAT',
            description: `The race IAT is part of a research study at Harvard and requires participants to be 18 years or old, so if you're under 18 completing this is not required to become an UPchieve coach.`,
            materialKey: 'sk8lyf',
            type: MaterialType.LINK,
            isRequired: true,
            linkUrl: 'https://implicit.harvard.edu/implicit/selectatest.html',
          },
          {
            name: 'Additional Resources',
            description:
              'The following resources are all optional, but we highly encourage you to go through them and learn as much as you can. These are important considerations to have during our day-to-day interactions, not just during a tutoring session!',
            materialKey: 'g34kfx',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Examples of Microaggressions',
                url: 'https://sph.umn.edu/site/docs/hewg/microaggressions.pdf',
              },
              {
                displayName:
                  "Examples of How Implicit Bias Can Influence Educators' Behavior",
                url: 'https://poorvucenter.yale.edu/ImplicitBiasAwareness',
              },
              {
                displayName: 'Podcast on Desegregation',
                url:
                  'https://www.thisamericanlife.org/562/the-problem-we-all-live-with-part-one',
              },
            ],
          },
        ],
      },
      {
        name: 'Community Safety & Success',
        materials: [
          {
            name: 'Community Safety & Success',
            materialKey: 'jsn832',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '773599358',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/community-safety-&-success-deck.pdf',
          },
          {
            name: 'UPchieve Student Safety Policy',
            materialKey: 'ps87f9',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-student-safety-policy.pdf',
          },
          {
            name: 'Academic Integrity',
            materialKey: '3gh7dh',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '776267126',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/academic-integrity-deck.pdf',
          },
          {
            name: 'UPchieve Academic Integrity Policy',
            materialKey: 'jgu55k',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-academic-integrity-policy.pdf',
          },
          {
            name: 'Review Coach Actions That Promote Success!',
            materialKey: '827abs',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/review-coach-actions-that-promote-success.pdf',
          },
          {
            name: `You've Got Support: Coach Community`,
            materialKey: 'n178sa',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '772490820',
          },
          {
            name: 'Engage in Our Coach Community',
            materialKey: 'psadn1',
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: 'Reminder: Join UPchieve Slack Community',
                url:
                  'https://join.slack.com/t/upchieveaccommunity/shared_invite/zt-1gihzt03n-Sj58fEdBiZjVwc4DPDdg0g',
              },
              {
                displayName: `Register for UPchieve's Monthly Coach Meetings`,
                url:
                  'https://us02web.zoom.us/meeting/register/uZUsduiqrzgiO4_zJG9YvVJcx8vBxt4snA',
              },
            ],
          },
        ],
      },
    ],
  },
]

export const courses: TrainingCourse[] = [
  {
    name: 'UPchieve 101',
    courseKey: 'upchieve101',
    description: `UPchieve101 will teach you everything you need to know to start helping students achieve their academic goals! You'll need to pass a short quiz at the end in order to be ready to coach.`,
    quizKey: 'upchieve101',
    quizName: 'UPchieve 101 Quiz',
    modules: [
      {
        name: 'Coaching on UPchieve',
        materials: [
          {
            name: 'Implementing Effective Coaching Strategies',
            materialKey: '7b6a76',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '760386859',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/implementing-effective-coaching-strategies-deck.pdf',
            links: [
              {
                displayName: 'Summary',
                url:
                  'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-coaching-strategies-v2.pdf',
              },
            ],
          },
        ],
      },
      {
        name: 'Community Safety & Success',
        materials: [
          {
            name: 'Community Safety & Success',
            materialKey: 'jsn832',
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: '773599358',
            videoPDF:
              'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/community-safety-&-success-deck.pdf',
          },
          {
            name: 'Review Safety Policy',
            materialKey: 'ps87f9',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-student-safety-policy.pdf',
          },
          {
            name: 'Review Academic Integrity Policy',
            materialKey: 'jgu55k',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-academic-integrity-policy.pdf',
          },
          {
            name: 'Review Diversity, Equity, and Inclusion Policy',
            materialKey: 'fj8tzq',
            type: MaterialType.DOCUMENT,
            isRequired: true,
            linkUrl:
              'https://cdn.upchieve.org/training-courses/upchieve101/volunteer-dei-policy-v2.pdf',
          },
        ],
      },
    ],
  },
]

function addUsingOurPlatformTo101(course: TrainingCourse) {
  const updatedCourse = cloneDeep(course)
  const material = {
    name: 'Using Our Platform',
    materialKey: '212h45',
    type: MaterialType.VIDEO,
    isRequired: true,
    resourceId: '797113791',
    videoPDF:
      'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/using-our-platform-deck-v2.pdf',
  }

  const coachingModule = updatedCourse.modules.find(
    module => module.name === 'Coaching on UPchieve'
  )
  if (coachingModule) coachingModule.materials.unshift(material)
  return updatedCourse
}

export const getCourse = async (
  courseKey: string,
  userId: Ulid
): Promise<TrainingCourse> => {
  const course = find(courses, { courseKey })
  if (!course)
    throw new Error(`Training course does not exist for key ${courseKey}`)

  const isShowPlatformActive = await getUsingOurPlatformFlag(userId)
  return isShowPlatformActive ? addUsingOurPlatformTo101(course) : course
}

const getRequiredMaterials = async (
  courseKey: string,
  userId: Ulid
): Promise<string[]> => {
  const course: TrainingCourse = await getCourse(courseKey, userId)
  return chain(course.modules)
    .map('materials')
    .flatten()
    .filter('isRequired')
    .map('materialKey')
    .value()
}

export const getProgress = async (
  courseKey: string,
  userCompleted: string[],
  userId: Ulid
): Promise<number> => {
  const requiredMaterials = await getRequiredMaterials(courseKey, userId)
  const completedMaterials = requiredMaterials.filter(mat =>
    userCompleted.includes(mat)
  )
  const fraction = completedMaterials.length / requiredMaterials.length
  return Math.floor(fraction * 100)
}
