import mongoose from 'mongoose';
import TrainingCtrl from '../../controllers/TrainingCtrl';
import { resetDb } from '../utils/db-utils';
import { buildCertifications } from '../utils/generate';
import { SUBJECTS } from '../../constants';

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await resetDb();
});

describe('Get a list of unlocked certs', () => {
  test('Should unlock proper certs when taking Precalculus and Pre-algebra is prior cert', async () => {
    const subject = SUBJECTS.PRECALCULUS;
    const certifications = buildCertifications({
      [SUBJECTS.PREALGREBA]: { passed: true, tries: 1 }
    });
    const expected = [
      SUBJECTS.PRECALCULUS,
      SUBJECTS.TRIGONOMETRY,
      SUBJECTS.ALGEBRA_TWO,
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.INTEGRATED_MATH_FOUR,
      SUBJECTS.SAT_MATH
    ];
    const result = TrainingCtrl.getUnlockedCerts(certifications, subject);

    expect(result).toEqual(expected);
  });

  test('Should unlock proper certs when taking Calculus AB and no prior certs', async () => {
    const subject = SUBJECTS.CALCULUS_AB;
    const certifications = buildCertifications();

    const expected = [
      SUBJECTS.CALCULUS_AB,
      SUBJECTS.PRECALCULUS,
      SUBJECTS.TRIGONOMETRY,
      SUBJECTS.ALGEBRA_TWO,
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.PREALGREBA,
      SUBJECTS.INTEGRATED_MATH_FOUR,
      SUBJECTS.SAT_MATH
    ];
    const result = TrainingCtrl.getUnlockedCerts(certifications, subject);

    await expect(result).toEqual(expected);
  });
  test('Should unlock proper certs when taking Calculus AB and have Geometry and Statistics has a cert', async () => {
    const subject = SUBJECTS.CALCULUS_AB;
    const certifications = buildCertifications({
      [SUBJECTS.GEOMETRY]: { passed: true, tries: 1 },
      [SUBJECTS.STATISTICS]: { passed: true, tries: 1 }
    });

    const expected = [
      SUBJECTS.CALCULUS_AB,
      SUBJECTS.PRECALCULUS,
      SUBJECTS.TRIGONOMETRY,
      SUBJECTS.ALGEBRA_TWO,
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.PREALGREBA,
      SUBJECTS.INTEGRATED_MATH_ONE,
      SUBJECTS.INTEGRATED_MATH_TWO,
      SUBJECTS.INTEGRATED_MATH_THREE,
      SUBJECTS.INTEGRATED_MATH_FOUR,
      SUBJECTS.SAT_MATH
    ];
    const result = TrainingCtrl.getUnlockedCerts(certifications, subject);

    await expect(result).toEqual(expected);
  });

  test('Certs that should only unlock themselves', async () => {
    const subjects = [
      [SUBJECTS.PREALGREBA],
      [SUBJECTS.STATISTICS],
      [SUBJECTS.GEOMETRY],
      [SUBJECTS.BIOLOGY],
      [SUBJECTS.CHEMISTRY],
      [SUBJECTS.PHYSICS_ONE],
      [SUBJECTS.PHYSICS_TWO],
      [SUBJECTS.ENVIRONMENTAL_SCIENCE],
      [SUBJECTS.PLANNING],
      [SUBJECTS.APPLICATIONS],
      [SUBJECTS.ESSAYS],
      [SUBJECTS.FINANCIAL_AID],
      [SUBJECTS.SPORTS_RECRUIMENT_PLANNING],
      [SUBJECTS.SAT_MATH],
      [SUBJECTS.SAT_READING]
    ];

    const expected = [
      [SUBJECTS.PREALGREBA],
      [SUBJECTS.STATISTICS],
      [SUBJECTS.GEOMETRY],
      [SUBJECTS.BIOLOGY],
      [SUBJECTS.CHEMISTRY],
      [SUBJECTS.PHYSICS_ONE],
      [SUBJECTS.PHYSICS_TWO],
      [SUBJECTS.ENVIRONMENTAL_SCIENCE],
      [SUBJECTS.PLANNING],
      [SUBJECTS.APPLICATIONS],
      [SUBJECTS.ESSAYS],
      [SUBJECTS.FINANCIAL_AID],
      [SUBJECTS.SPORTS_RECRUIMENT_PLANNING],
      [SUBJECTS.SAT_MATH],
      [SUBJECTS.SAT_READING]
    ];

    for (let i = 0; i < subjects.length; i++) {
      const certifications = buildCertifications();
      const result = TrainingCtrl.getUnlockedCerts(certifications, subjects[i]);
      await expect(result).toEqual(expected[i]);
    }
  });
});