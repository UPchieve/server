// Auto-mock declarations for every module the SUT or tests touch in this
// folder. Test files import this module BEFORE any other import so the mocks
// register before the SUT is required. ts-jest's hoist transform only fires
// for files matched by testMatch, so a file with imports cannot host these
// calls — this file is deliberately import-free.
jest.mock('../../../models/User/queries')
jest.mock('../../../models/Student/queries')
jest.mock('../../../models/Teacher/queries')
jest.mock('../../../models/StudentPartnerOrg/queries')
jest.mock('../../../models/SignUpSource/queries')
jest.mock('../../../models/UserSessionMetrics/queries')
jest.mock('../../../models/UserProductFlags/queries')
jest.mock('../../../models/UserAction/queries')
jest.mock('../../../models/FederatedCredential/queries')
jest.mock('../../../models/UsersSchools')
jest.mock('../../../models/UsersGradeLevels')
jest.mock('../../../services/AuthService')
jest.mock('../../../services/EligibilityService')
jest.mock('../../../services/MailService')
jest.mock('../../../services/ReferralService')
jest.mock('../../../services/TeacherService')
jest.mock('../../../utils/auth-utils')
