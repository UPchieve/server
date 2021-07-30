import { shallowMount } from '@vue/test-utils';

import RecentSubjectCard from '../../../src/views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'

//👇 Imports a specific story for the test
import { PrimaryButton, SecondaryButton } from '../../../src/stories/RecentSubjectCard.stories';

//test for default recent subject card -> this test fails
// @todo: figure out why checking for svg object is failing when it exists; unit testing for component tags?
it('renders recent subject card', () =>{
  const wrapper = shallowMount(RecentSubjectCard, {
    propsData: PrimaryButton.args,
  });
  expect(wrapper.is(RecentSubjectCard));
  expect(wrapper.props('title')).toBe('Algebra 1');
  expect(wrapper.find("#SubjectCard-desktop-column").exists()).toBeTruthy();
  expect(wrapper.find('svg')).toBe('MathSVG');
  expect(wrapper.find('ArrowIcon').exists()).toBeTruthy();
  expect(wrapper.find('ArrowIcon').isVisible()).toBeTruthy();
});

//test for disabled recent subject card -> this test passes
it('renders the recent subject button in the disabled state', () => {
  const wrapper = shallowMount(RecentSubjectCard, {
    propsData: SecondaryButton.args,
  });
  expect(wrapper.props('title')).toBe('Algebra 2');
  expect(wrapper.find('disableSubjectCard')).toBeTruthy();
  expect(wrapper.find('ArrowIcon').exists()).toBeFalsy();
});