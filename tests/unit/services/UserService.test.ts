import mongoose from 'mongoose';
import UserService from '../../../services/UserService';
import VolunteerModel from '../../../models/Volunteer';
import { PHOTO_ID_STATUS, REFERENCE_STATUS, STATUS } from '../../../constants';
import { Volunteer } from '../../utils/types';
import {
  buildVolunteer,
  buildReference,
  buildReferenceForm,
  buildPhotoIdData,
  buildReferenceWithForm
} from '../../utils/generate';
import { insertVolunteer, resetDb } from '../../utils/db-utils';
jest.mock('../../../services/MailService');

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

test('Successfully adds photoIdS3Key and photoIdStatus', async () => {
  const volunteer = buildVolunteer();
  await insertVolunteer(volunteer);
  const { _id: userId } = volunteer;
  const newPhotoIdS3Key = await UserService.addPhotoId({ userId });

  const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
    _id: userId
  })
    .select('photoIdS3Key photoIdStatus')
    .lean()
    .exec();

  expect(newPhotoIdS3Key).toMatch(/^[a-f0-9]{64}$/);
  expect(updatedVolunteer.photoIdS3Key).toEqual(newPhotoIdS3Key);
  expect(updatedVolunteer.photoIdStatus).toEqual(PHOTO_ID_STATUS.SUBMITTED);
  expect(updatedVolunteer.photoIdStatus).not.toEqual(PHOTO_ID_STATUS.EMPTY);
});

test('Should add a reference', async () => {
  const volunteer = buildVolunteer();
  await insertVolunteer(volunteer);
  const { _id: userId } = volunteer;
  const reference = buildReference();
  const input = {
    userId,
    referenceName: reference.name,
    referenceEmail: reference.email
  };

  await UserService.addReference(input);

  const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const expectedResult = {
    name: input.referenceName,
    email: input.referenceEmail,
    status: REFERENCE_STATUS.UNSENT
  };

  expect(updatedVolunteer.references[0]).toMatchObject(expectedResult);
  expect(updatedVolunteer.references.length).toEqual(1);
});

test('Should delete a reference', async () => {
  const referenceOne = buildReference();
  const referenceTwo = buildReference();
  const references = [referenceOne, referenceTwo];
  const volunteer = buildVolunteer({ references });
  await insertVolunteer(volunteer);

  const { _id: userId } = volunteer;
  const input = {
    userId,
    referenceEmail: referenceOne.email
  };

  await UserService.deleteReference(input);

  const updatedVolunteer: Partial<Volunteer> = await VolunteerModel.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const remainingReference = {
    name: referenceTwo.name,
    email: referenceTwo.email,
    status: REFERENCE_STATUS.UNSENT
  };

  const removedReference = {
    name: referenceOne.name,
    email: referenceOne.email
  };

  expect(updatedVolunteer.references.length).toEqual(1);
  expect(updatedVolunteer.references).not.toContainEqual(
    expect.objectContaining({ ...removedReference })
  );
  expect(updatedVolunteer.references[0]).toMatchObject(remainingReference);
});

test('Should save reference form data', async () => {
  const reference = buildReference();
  const references = [reference];
  const volunteer = buildVolunteer({ references });
  await insertVolunteer(volunteer);
  const { _id: userId } = volunteer;

  const referenceFormInput = {
    referenceId: reference._id,
    referenceFormData: buildReferenceForm()
  };

  await UserService.saveReferenceForm(referenceFormInput);

  const {
    references: updatedReferences
  }: Partial<Volunteer> = await VolunteerModel.findOne({
    _id: userId
  })
    .select('references')
    .lean()
    .exec();

  const [updatedReference] = updatedReferences;

  expect(updatedReference).toMatchObject(referenceFormInput.referenceFormData);
});

test.todo('Admin should get pending volunteers');

test('Pending volunteer should not be approved after being rejected', async () => {
  const options = {
    references: [buildReferenceWithForm(), buildReferenceWithForm()],
    ...buildPhotoIdData()
  };
  const volunteer = buildVolunteer(options);
  await insertVolunteer(volunteer);
  const input = {
    volunteerId: volunteer._id,
    photoIdStatus: PHOTO_ID_STATUS.APPROVED,
    referencesStatus: [REFERENCE_STATUS.APPROVED, REFERENCE_STATUS.REJECTED],
    hasCompletedBackgroundInfo: false
  };

  await UserService.updatePendingVolunteerStatus(input);
  const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
    .lean()
    .select('photoIdStatus references.status isApproved')
    .exec();

  const expectedResult = {
    photoIdStatus: input.photoIdStatus,
    references: [
      { status: input.referencesStatus[0] },
      { status: input.referencesStatus[1] }
    ],
    isApproved: false
  };

  expect(updatedVolunteer).toMatchObject(expectedResult);
});

test('Pending volunteer should be approved after approval', async () => {
  const options = {
    references: [buildReferenceWithForm(), buildReferenceWithForm()],
    ...buildPhotoIdData()
  };
  const volunteer = buildVolunteer(options);
  await insertVolunteer(volunteer);
  const input = {
    volunteerId: volunteer._id,
    photoIdStatus: PHOTO_ID_STATUS.APPROVED,
    referencesStatus: [REFERENCE_STATUS.APPROVED, REFERENCE_STATUS.APPROVED],
    hasCompletedBackgroundInfo: true
  };

  await UserService.updatePendingVolunteerStatus(input);
  const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
    .lean()
    .select('photoIdStatus references.status isApproved')
    .exec();

  const expectedResult = {
    photoIdStatus: input.photoIdStatus,
    references: [
      { status: input.referencesStatus[0] },
      { status: input.referencesStatus[1] }
    ],
    isApproved: true
  };

  expect(updatedVolunteer).toMatchObject(expectedResult);
});

test('Open volunteer is not approved when submitting their background info is not the final approval step', async () => {
  const volunteer = buildVolunteer({
    references: [],
    photoIdStatus: STATUS.APPROVED
  });
  await insertVolunteer(volunteer);
  const input = {
    isApproved: false,
    volunteerId: volunteer._id,
    references: volunteer.references,
    volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    photoIdStatus: volunteer.photoIdStatus,
    update: {
      occupation: ['An undergraduate student'],
      experience: '5+ years',
      background: ['Went to a Title 1/low-income high school'],
      languages: ['Spanish']
    }
  };

  await UserService.addBackgroundInfo(input);
  const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
    .lean()
    .select('isApproved occupation experience background languages')
    .exec();

  const expectedResult = {
    occupation: input.update.occupation,
    languages: input.update.languages,
    experience: input.update.experience,
    background: input.update.background,
    isApproved: false
  };

  expect(updatedVolunteer).toMatchObject(expectedResult);
});

test('Open volunteer is approved when submitting their background info is the final approval step', async () => {
  const volunteer = buildVolunteer({
    references: [
      buildReference({ status: STATUS.APPROVED }),
      buildReference({ status: STATUS.APPROVED })
    ],
    photoIdStatus: STATUS.APPROVED
  });
  await insertVolunteer(volunteer);
  const input = {
    isApproved: volunteer.isApproved,
    volunteerId: volunteer._id,
    references: volunteer.references,
    volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    photoIdStatus: volunteer.photoIdStatus,
    update: {
      occupation: ['An undergraduate student'],
      experience: '5+ years',
      background: ['Went to a Title 1/low-income high school'],
      languages: ['Spanish']
    }
  };

  await UserService.addBackgroundInfo(input);
  const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
    .lean()
    .select('isApproved')
    .exec();

  const expectedResult = {
    isApproved: true
  };

  expect(updatedVolunteer).toMatchObject(expectedResult);
});

test('Partner Volunteer is approved when submitting background info', async () => {
  const volunteer = buildVolunteer({
    references: [
      buildReference({ status: STATUS.APPROVED }),
      buildReference({ status: STATUS.APPROVED })
    ],
    photoIdStatus: STATUS.APPROVED,
    volunteerPartnerOrg: 'example'
  });
  await insertVolunteer(volunteer);

  const input = {
    isApproved: volunteer.isApproved,
    volunteerId: volunteer._id,
    volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    update: {
      occupation: ['An undergraduate student'],
      experience: '5+ years',
      background: ['Went to a Title 1/low-income high school'],
      languages: []
    }
  };

  await UserService.addBackgroundInfo(input);
  const updatedVolunteer = await VolunteerModel.findOne({ _id: volunteer._id })
    .lean()
    .select('isApproved occupation experience background languages')
    .exec();

  const expectedResult = {
    isApproved: true,
    occupation: ['An undergraduate student'],
    experience: '5+ years',
    background: ['Went to a Title 1/low-income high school'],
    languages: []
  };

  expect(updatedVolunteer).toMatchObject(expectedResult);
});
