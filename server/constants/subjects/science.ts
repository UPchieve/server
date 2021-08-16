import { Certification, Subject } from './types'

const BIOLOGY: Subject = {
  key: 'biology',
  displayName: 'Biology',
  launched: true
}
const CHEMISTRY: Subject = {
  key: 'chemistry',
  displayName: 'Chemistry',
  launched: true
}
const PHYSICS_ONE: Subject = {
  key: 'physicsOne',
  displayName: 'Physics 1',
  launched: true
}
const PHYSICS_TWO: Subject = {
  key: 'physicsTwo',
  displayName: 'Physics 2',
  launched: false
}
const ENVIRONMENTAL_SCIENCE: Subject = {
  key: 'environmentalScience',
  displayName: 'Environmental Science',
  launched: false
}

export interface RootScienceCertsType {
  BIOLOGY: Certification
  CHEMISTRY: Certification
  PHYSICS_ONE: Certification
  PHYSICS_TWO: Certification
  ENVIRONMENTAL_SCIENCE: Certification
}

export const SCIENCE_CERTS: RootScienceCertsType = {
  BIOLOGY: {
    key: BIOLOGY.key,
    displayName: BIOLOGY.displayName,
    numQuestions: 1,
    unlocks: [BIOLOGY],
    subCategories: [
      'biochemistry',
      'the cell',
      'cell division',
      'cellular respiration',
      'photosynthesis and plants',
      'classical genetics',
      'molecular genetics',
      'animal behavior and physiology',
      'ecology',
      'human physiology and anatomy',
      'evolution and taxonomy'
    ]
  },
  CHEMISTRY: {
    key: CHEMISTRY.key,
    displayName: CHEMISTRY.displayName,
    numQuestions: 1,
    unlocks: [CHEMISTRY],
    subCategories: [
      'chemical reactions',
      'atoms, compounds, and ions',
      'stoichiometry',
      'electron structure of atoms',
      'periodic table',
      'chemical bonds',
      'gases',
      'states of matter and intermolecular forces',
      'chemical equilibrium',
      'acids and bases',
      'buffers, titrations, and solubility equilibria',
      'thermodynamics',
      'redox reactions and electrochemistry',
      'kinetics',
      'nuclear chemistry',
      'kinematics'
    ]
  },
  PHYSICS_ONE: {
    key: PHYSICS_ONE.key,
    displayName: PHYSICS_ONE.displayName,
    numQuestions: 1,
    unlocks: [PHYSICS_ONE],
    subCategories: [
      'kinematics',
      // eslint-disable-next-line quotes
      "newton's laws",
      'rotational mechanics',
      'work and energy',
      'momentum and collisions',
      'thermodynamics',
      'electrostatics',
      'magnetism',
      'waves and sound',
      'refraction and reflection',
      'gravity/gen relativity'
    ]
  },
  PHYSICS_TWO: {
    key: PHYSICS_TWO.key,
    displayName: PHYSICS_TWO.displayName,
    numQuestions: 1,
    unlocks: [PHYSICS_ONE, PHYSICS_TWO],
    subCategories: [
      'Fluids - density and pressure',
      'Fluids - dynamics',
      'THD - Ideal Gases',
      'thermodynamics',
      'Electric Field',
      'Electric Potential',
      'Magnetic Fields',
      'Magnetic Induction',
      'Electromagnetic Waves',
      'Optics - refraction and reflection',
      'Quantum & Atomic Physics',
      'dynamics 2',
      'Electric Circuits'
    ]
  },
  ENVIRONMENTAL_SCIENCE: {
    key: ENVIRONMENTAL_SCIENCE.key,
    displayName: ENVIRONMENTAL_SCIENCE.displayName,
    numQuestions: 1,
    unlocks: [ENVIRONMENTAL_SCIENCE],
    subCategories: [
      'earth systems and resources',
      'ecology',
      'energy resources and consumption',
      'global change',
      'impact of human health and environment',
      'interdependence of organisms',
      'land and water resources and use',
      'introduction to environmental science',
      'natural biogeochemical cycles',
      'pollution',
      'populations',
      'the atmosphere'
    ]
  }
}

export interface RootScienceSubjectsType {
  BIOLOGY: Subject
  CHEMISTRY: Subject
  PHYSICS_ONE: Subject
  PHYSICS_TWO: Subject
  ENVIRONMENTAL_SCIENCE: Subject
}

export const SCIENCE_SUBJECTS: RootScienceSubjectsType = {
  BIOLOGY: BIOLOGY,
  CHEMISTRY: CHEMISTRY,
  PHYSICS_ONE: PHYSICS_ONE,
  PHYSICS_TWO: PHYSICS_TWO,
  ENVIRONMENTAL_SCIENCE: ENVIRONMENTAL_SCIENCE
}
