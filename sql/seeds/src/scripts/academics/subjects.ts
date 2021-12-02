import pool from '../../pg-pool'
import * as db from 'zapatos/db'

async function getTopicId(topicName: string): Promise<number> {
    const topic = await db.selectExactlyOne('topics', { name: topicName }).run(pool)
    return(topic.id)
}

async function getSubjectId(subjectName: string): Promise<number> {
    const subject = await db.selectExactlyOne('subjects', { name: subjectName }).run(pool)
    return(subject.id)
}

async function getToolTypeId(toolTypeName: string): Promise<number> {
    const toolType = await db.selectExactlyOne('tool_types', { name: toolTypeName }).run(pool)
    return(toolType.id)
}

async function getComputedSubjectId(computedSubjectName: string): Promise<number> {
    const computedSubject = await db.selectExactlyOne('computed_subjects', { name: computedSubjectName }).run(pool)
    return(computedSubject.id)
}

async function getCompositeSubjectIds(subjectNames: string[]): Promise<number[]> {
    const ids: number[] = []
    const lookups = subjectNames.map(name => {
        return db.selectExactlyOne('subjects', { name: name }).run(pool)
            .then(subject => {
                ids.push(subject.id)
            })
    })
    await Promise.all(lookups)
    return ids
}

export async function subjects() {
    await db.insert('subjects', [
        { updated_at: new Date(), created_at: new Date(), name: 'prealgebra', display_name: 'Prealgebra', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 1 },
        { updated_at: new Date(), created_at: new Date(), name: 'algebraOne', display_name: 'Algebra 1', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 2 },
        { updated_at: new Date(), created_at: new Date(), name: 'algebraTwo', display_name: 'Algebra 2', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 3 },
        { updated_at: new Date(), created_at: new Date(), name: 'geometry', display_name: 'Geometry', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 4 },
        { updated_at: new Date(), created_at: new Date(), name: 'trigonometry', display_name: 'Trigonometry', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 5 },
        { updated_at: new Date(), created_at: new Date(), name: 'precalculus', display_name: 'Precalculus', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 6 },
        { updated_at: new Date(), created_at: new Date(), name: 'calculusAB', display_name: 'Calculus AB', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 7 },
        { updated_at: new Date(), created_at: new Date(), name: 'calculusBC', display_name: 'Calculus BC', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 8 },
        { updated_at: new Date(), created_at: new Date(), name: 'statistics', display_name: 'Statistics', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 9 },
        { updated_at: new Date(), created_at: new Date(), name: 'biology', display_name: 'Biology', topic_id: await getTopicId('science'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 1 },
        { updated_at: new Date(), created_at: new Date(), name: 'chemistry', display_name: 'Chemistry', topic_id: await getTopicId('science'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 2 },
        { updated_at: new Date(), created_at: new Date(), name: 'physicsOne', display_name: 'Physics 1', topic_id: await getTopicId('science'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 3 },
        { updated_at: new Date(), created_at: new Date(), name: 'physicsTwo', display_name: 'Physics 2', topic_id: await getTopicId('science'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 4 },
        { updated_at: new Date(), created_at: new Date(), name: 'environmentalScience', display_name: 'Environmental Science', topic_id: await getTopicId('science'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 5 },
        { updated_at: new Date(), created_at: new Date(), name: 'satMath', display_name: 'SAT Math', topic_id: await getTopicId('sat'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 1 },
        { updated_at: new Date(), created_at: new Date(), name: 'satReading', display_name: 'SAT Reading', topic_id: await getTopicId('sat'), tool_type_id: await getToolTypeId('documenteditor'), display_order: 2 },
        { updated_at: new Date(), created_at: new Date(), name: 'essays', display_name: 'College Essays', topic_id: await getTopicId('college'), tool_type_id: await getToolTypeId('documenteditor'), display_order: 2 },
        { updated_at: new Date(), created_at: new Date(), name: 'planning', display_name: 'Planning', topic_id: await getTopicId('college'), tool_type_id: await getToolTypeId('documenteditor'), display_order: 1 },
        { updated_at: new Date(), created_at: new Date(), name: 'applications', display_name: 'Applications', topic_id: await getTopicId('college'), tool_type_id: await getToolTypeId('documenteditor'), display_order: 3 },
        { updated_at: new Date(), created_at: new Date(), name: 'humanitiesEssays', display_name: 'Humanities Essays', topic_id: await getTopicId('readingWriting'), tool_type_id: await getToolTypeId('documenteditor'), display_order: 1 },
    ]).run(pool)
}

export async function computedSubjects() {
    await db.insert('computed_subjects', [
        { updated_at: new Date(), created_at: new Date(), name: 'integratedMathOne', display_name: 'Integrated Math 1', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 10 },
        { updated_at: new Date(), created_at: new Date(), name: 'integratedMathTwo', display_name: 'Integrated Math 2', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 11 },
        { updated_at: new Date(), created_at: new Date(), name: 'integratedMathThree', display_name: 'Integrated Math 3', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 12 },
        { updated_at: new Date(), created_at: new Date(), name: 'integratedMathFour', display_name: 'Integrated Math 4', topic_id: await getTopicId('math'), tool_type_id: await getToolTypeId('whiteboard'), display_order: 13 },
    ]).run(pool)
}

export async function computedSubjectComposition() {
    await db.insert('computed_subject_composition', [
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathOne'), subject_id: await getSubjectId('algebraOne')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathOne'), subject_id: await getSubjectId('geometry')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathOne'), subject_id: await getSubjectId('statistics')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathTwo'), subject_id: await getSubjectId('algebraOne')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathTwo'), subject_id: await getSubjectId('geometry')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathTwo'), subject_id: await getSubjectId('statistics')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathTwo'), subject_id: await getSubjectId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathThree'), subject_id: await getSubjectId('precalculus')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathThree'), subject_id: await getSubjectId('statistics')},
        { updated_at: new Date(), created_at: new Date(), computed_subject_id: await getComputedSubjectId('integratedMathFour'), subject_id: await getSubjectId('precalculus')},

    ]).run(pool)
}
