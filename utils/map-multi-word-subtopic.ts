import { INTEGRATED_MATH_MAPPING, PHYSICS_MAPPING } from '../constants';
import isIntegratedMath from './is-integrated-math';
import isPhysics from './is-physics';

const mapMultiWordSubtopics = (subtopic): string => {
  if (isIntegratedMath(subtopic)) return INTEGRATED_MATH_MAPPING[subtopic];
  if (isPhysics(subtopic)) return PHYSICS_MAPPING[subtopic];

  return subtopic;
};

export default mapMultiWordSubtopics;
