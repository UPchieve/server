import pool from '../../pg-pool'
import * as db from 'zapatos/db'

async function getQuizId(quizName: string) {
    const quiz = await db.selectExactlyOne('quizzes', { name: quizName }).run(pool)
    return quiz.id
}

async function getSubjectId(subjectName: string) {
    const subject = await db.selectExactlyOne('subjects', { name: subjectName }).run(pool)
    return subject.id
}

export async function quizzes() {
    await db.insert('quizzes', [
        { updated_at: new Date(), created_at: new Date(), name: 'prealgebra' },
        { updated_at: new Date(), created_at: new Date(), name: 'statistics'},
        { updated_at: new Date(), created_at: new Date(), name: 'geometry' },
        { updated_at: new Date(), created_at: new Date(), name: 'biology'},
        { updated_at: new Date(), created_at: new Date(), name: 'chemistry'},
        { updated_at: new Date(), created_at: new Date(), name: 'physicsOne'},
        { updated_at: new Date(), created_at: new Date(), name: 'physicsTwo'},
        { updated_at: new Date(), created_at: new Date(), name: 'environmentalScience' },
        { updated_at: new Date(), created_at: new Date(), name: 'essays' },
        { updated_at: new Date(), created_at: new Date(), name: 'applications'},
        { updated_at: new Date(), created_at: new Date(), name: 'planning',},
        { updated_at: new Date(), created_at: new Date(), name: 'satMath',  },
        { updated_at: new Date(), created_at: new Date(), name: 'satReading', },
        { updated_at: new Date(), created_at: new Date(), name: 'collegeCounseling', },
        { updated_at: new Date(), created_at: new Date(), name: 'humanitiesEssays',  },
        { updated_at: new Date(), created_at: new Date(), name: 'algebra',  },
        { updated_at: new Date(), created_at: new Date(), name: 'trigonometry',  },
        { updated_at: new Date(), created_at: new Date(), name: 'precalculus',  },
        { updated_at: new Date(), created_at: new Date(), name: 'calculusAB',  },
        { updated_at: new Date(), created_at: new Date(), name: 'calculusBC',  },
    ]).run(pool)
}

export async function quizSubjectUnlocks() {
    await db.insert('quiz_subject_unlocks', [
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('prealgebra'), subject_id: await getSubjectId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('statistics'), subject_id: await getSubjectId('statistics')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('geometry'), subject_id: await getSubjectId('geometry')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('biology'), subject_id: await getSubjectId('biology')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('chemistry'), subject_id: await getSubjectId('chemistry')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('physicsOne'), subject_id: await getSubjectId('physicsOne')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('physicsTwo'), subject_id: await getSubjectId('physicsTwo')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('environmentalScience'), subject_id: await getSubjectId('environmentalScience')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('essays'), subject_id: await getSubjectId('essays')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('applications'), subject_id: await getSubjectId('applications')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('planning'), subject_id: await getSubjectId('planning')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('satMath'), subject_id: await getSubjectId('satMath')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('satReading'), subject_id: await getSubjectId('satReading')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('collegeCounseling'), subject_id: await getSubjectId('planning')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('collegeCounseling'), subject_id: await getSubjectId('applications')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('humanitiesEssays'), subject_id: await getSubjectId('humanitiesEssays')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('algebra'), subject_id: await getSubjectId('algebraOne')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('algebra'), subject_id: await getSubjectId('algebraTwo')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('algebra'), subject_id: await getSubjectId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('trigonometry'), subject_id: await getSubjectId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('precalculus'), subject_id: await getSubjectId('algebraOne')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('precalculus'), subject_id: await getSubjectId('algebraTwo')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('precalculus'), subject_id: await getSubjectId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('precalculus'), subject_id: await getSubjectId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('precalculus'), subject_id: await getSubjectId('precalculus')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusAB'), subject_id: await getSubjectId('algebraOne')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusAB'), subject_id: await getSubjectId('algebraTwo')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusAB'), subject_id: await getSubjectId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusAB'), subject_id: await getSubjectId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusAB'), subject_id: await getSubjectId('precalculus')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusAB'), subject_id: await getSubjectId('calculusAB')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('algebraOne')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('algebraTwo')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('precalculus')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('calculusAB')},
        { updated_at: new Date(), created_at: new Date(), quiz_id: await getQuizId('calculusBC'), subject_id: await getSubjectId('calculusBC')},
    ]).run(pool)
}

export async function quizSubcategories() {
    await db.insert('quiz_subcategories', [
        { updated_at: new Date(), created_at: new Date(), name: 'numbers', quiz_id: await getQuizId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'arithmetic properties', quiz_id: await getQuizId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'exponents', quiz_id: await getQuizId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'exponents and radicals', quiz_id: await getQuizId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'polynomials', quiz_id: await getQuizId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'fractions', quiz_id: await getQuizId('prealgebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'linear equations', quiz_id: await getQuizId('algebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'rational exponents and radicals', quiz_id: await getQuizId('algebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'application of linear equations', quiz_id: await getQuizId('algebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'two variable equations', quiz_id: await getQuizId('algebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'rational expressions', quiz_id: await getQuizId('algebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'complex numbers', quiz_id: await getQuizId('algebra')},
        { updated_at: new Date(), created_at: new Date(), name: 'congruence and similarity', quiz_id: await getQuizId('geometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'vertices', quiz_id: await getQuizId('geometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'angles', quiz_id: await getQuizId('geometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'circles', quiz_id: await getQuizId('geometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'triangles', quiz_id: await getQuizId('geometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'rectangles', quiz_id: await getQuizId('geometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'angles', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'triangles', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'right triangles', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'quadrants', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'radians', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'unit circles', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'inequalities', quiz_id: await getQuizId('trigonometry')},
        { updated_at: new Date(), created_at: new Date(), name: 'representing data numerically', quiz_id: await getQuizId('statistics')},
        { updated_at: new Date(), created_at: new Date(), name: 'representing data graphically', quiz_id: await getQuizId('statistics')},
        { updated_at: new Date(), created_at: new Date(), name: 'two means', quiz_id: await getQuizId('statistics')},
        { updated_at: new Date(), created_at: new Date(), name: 'representing data graphically', quiz_id: await getQuizId('statistics')},
    ]).run(pool)
}
