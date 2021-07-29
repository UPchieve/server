import { shallowMount } from '@vue/test-utils';

import RecentSubjectCard from '../../../src/views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'

//👇 Imports a specific story for the test
import { PrimaryButton, SecondaryButton } from '../../../src/stories/RecentSubjectCard.stories';

it('renders recent subject card', () =>{
  const wrapper = shallowMount(RecentSubjectCard, {
    propsData: PrimaryButton.args,
  });
  expect(wrapper.is(RecentSubjectCard));
  expect(wrapper.find('title')).toBe('Algebra 1');
  expect(wrapper.find('svg')).toMatchObject('MathSVG');
  expect(wrapper.find('ArrowIcon').exists()).toBeTruthy();
  expect(wrapper.find('ArrowIcon').isVisible()).toBeTruthy();
});

it('renders the recent subject button in the disabled state', () => {
  const wrapper = shallowMount(RecentSubjectCard, {
    propsData: SecondaryButton.args,
  });
  expect(wrapper.find('disableSubjectCard')).toBeTruthy();
  expect(wrapper.find('ArrowIcon').exists()).toBeFalsy();
});