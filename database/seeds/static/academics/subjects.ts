import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function subjects(
  topicIds: NameToId,
  toolIds: NameToId
): Promise<NameToId> {
  const subjects = [
    {
      name: 'prealgebra',
      displayName: 'Prealgebra',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 1,
    },
    {
      name: 'algebraOne',
      displayName: 'Algebra 1',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 2,
    },
    {
      name: 'algebraTwo',
      displayName: 'Algebra 2',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 3,
    },
    {
      name: 'geometry',
      displayName: 'Geometry',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 4,
    },
    {
      name: 'trigonometry',
      displayName: 'Trigonometry',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 5,
    },
    {
      name: 'precalculus',
      displayName: 'Precalculus',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 6,
    },
    {
      name: 'calculusAB',
      displayName: 'Calculus AB',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 7,
    },
    {
      name: 'calculusBC',
      displayName: 'Calculus BC',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 8,
    },
    {
      name: 'statistics',
      displayName: 'Statistics',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 9,
    },
    {
      name: 'biology',
      displayName: 'Biology',
      topicId: topicIds['science'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 1,
    },
    {
      name: 'chemistry',
      displayName: 'Chemistry',
      topicId: topicIds['science'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 2,
    },
    {
      name: 'physicsOne',
      displayName: 'Physics 1',
      topicId: topicIds['science'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 3,
    },
    {
      name: 'physicsTwo',
      displayName: 'Physics 2',
      topicId: topicIds['science'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 4,
    },
    {
      name: 'environmentalScience',
      displayName: 'Environmental Science',
      topicId: topicIds['science'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 5,
    },
    {
      name: 'satMath',
      displayName: 'SAT Math',
      topicId: topicIds['sat'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 1,
    },
    {
      name: 'satReading',
      displayName: 'SAT Reading',
      topicId: topicIds['sat'] as number,
      toolTypeId: toolIds['documenteditor'] as number,
      displayOrder: 2,
    },
    {
      name: 'essays',
      displayName: 'College Essays',
      topicId: topicIds['college'] as number,
      toolTypeId: toolIds['documenteditor'] as number,
      displayOrder: 2,
    },
    {
      name: 'planning',
      displayName: 'Planning',
      topicId: topicIds['college'] as number,
      toolTypeId: toolIds['documenteditor'] as number,
      displayOrder: 1,
    },
    {
      name: 'applications',
      displayName: 'Applications',
      topicId: topicIds['college'] as number,
      toolTypeId: toolIds['documenteditor'] as number,
      displayOrder: 3,
    },
    {
      name: 'humanitiesEssays',
      displayName: 'Humanities Essays',
      topicId: topicIds['readingWriting'] as number,
      toolTypeId: toolIds['documenteditor'] as number,
      displayOrder: 1,
    },
    {
      name: 'integratedMathOne',
      displayName: 'Integrated Math One',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 9,
    },
    {
      name: 'integratedMathTwo',
      displayName: 'Integrated Math Two',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 9,
    },
    {
      name: 'integratedMathThree',
      displayName: 'Integrated Math Three',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 9,
    },
    {
      name: 'integratedMathFour',
      displayName: 'Integrated Math Four',
      topicId: topicIds['math'] as number,
      toolTypeId: toolIds['whiteboard'] as number,
      displayOrder: 9,
    },
  ]
  const temp: NameToId = {}
  for (const sub of subjects) {
    temp[sub.name] = await wrapInsert('subjects', pgQueries.insertSubject.run, {
      ...sub,
    })
  }
  return temp
}

export async function certificationSubjectUnlocks(
  subIds: NameToId,
  certIds: NameToId
) {
  const certificationSubjectUnlocks = [
    {
      subjectId: subIds['integratedMathOne'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      subjectId: subIds['integratedMathOne'] as number,
      certificationId: certIds['geometry'] as number,
    },
    {
      subjectId: subIds['integratedMathOne'] as number,
      certificationId: certIds['statistics'] as number,
    },
    {
      subjectId: subIds['integratedMathTwo'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      subjectId: subIds['integratedMathTwo'] as number,
      certificationId: certIds['geometry'] as number,
    },
    {
      subjectId: subIds['integratedMathTwo'] as number,
      certificationId: certIds['statistics'] as number,
    },
    {
      subjectId: subIds['integratedMathTwo'] as number,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      subjectId: subIds['integratedMathThree'] as number,
      certificationId: certIds['precalculus'] as number,
    },
    {
      subjectId: subIds['integratedMathThree'] as number,
      certificationId: certIds['statistics'] as number,
    },
    {
      subjectId: subIds['integratedMathFour'] as number,
      certificationId: certIds['precalculus'] as number,
    },
    {
      subjectId: subIds['prealgebra'] as number,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      subjectId: subIds['statistics'] as number,
      certificationId: certIds['statistics'] as number,
    },
    {
      subjectId: subIds['geometry'] as number,
      certificationId: certIds['geometry'] as number,
    },
    {
      subjectId: subIds['biology'] as number,
      certificationId: certIds['biology'] as number,
    },
    {
      subjectId: subIds['chemistry'] as number,
      certificationId: certIds['chemistry'] as number,
    },
    {
      subjectId: subIds['physicsOne'] as number,
      certificationId: certIds['physicsOne'] as number,
    },
    {
      subjectId: subIds['physicsTwo'] as number,
      certificationId: certIds['physicsTwo'] as number,
    },
    {
      subjectId: subIds['environmentalScience'] as number,
      certificationId: certIds['environmentalScience'] as number,
    },
    {
      subjectId: subIds['essays'] as number,
      certificationId: certIds['essays'] as number,
    },
    {
      subjectId: subIds['applications'] as number,
      certificationId: certIds['applications'] as number,
    },
    {
      subjectId: subIds['planning'] as number,
      certificationId: certIds['planning'] as number,
    },
    {
      subjectId: subIds['satMath'] as number,
      certificationId: certIds['satMath'] as number,
    },
    {
      subjectId: subIds['satReading'] as number,
      certificationId: certIds['satReading'] as number,
    },
    // {
    //   updated_at: new Date(),
    //   created_at: new Date(),
    //   subjectId: subIds['collegeCounseling'),
    //   certificationId: certIds['collegeCounseling')
    // },
    {
      subjectId: subIds['humanitiesEssays'] as number,
      certificationId: certIds['humanitiesEssays'] as number,
    },
    {
      subjectId: subIds['algebraOne'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      subjectId: subIds['algebraTwo'] as number,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      subjectId: subIds['trigonometry'] as number,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      subjectId: subIds['precalculus'] as number,
      certificationId: certIds['precalculus'] as number,
    },
    {
      subjectId: subIds['calculusAB'] as number,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      subjectId: subIds['calculusBC'] as number,
      certificationId: certIds['calculusBC'] as number,
    },
  ]
  for (const x of certificationSubjectUnlocks) {
    await wrapInsert(
      'certification_subject_unlocks',
      pgQueries.insertCertificationSubjectUnlocks.run,
      { ...x }
    )
  }
}
