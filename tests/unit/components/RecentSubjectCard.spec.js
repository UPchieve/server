import { shallowMount } from '@vue/test-utils';

import RecentSubjectCard from '../../../src/views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'

//import ArrowIcon from '../../../src/assets/arrow.svg';

//👇 Imports a specific story for the test
import { PrimaryButton, SecondaryButton } from '../../../src/stories/RecentSubjectCard.stories';

describe("RecentSubjectCard", () => {
  it('renders recent subject card', () =>{
    const wrapper = shallowMount(RecentSubjectCard, {
      propsData: PrimaryButton.args
    });

    expect(wrapper.is(RecentSubjectCard));
    expect(wrapper.props('title')).toBe('Algebra 1');
    expect(wrapper.props('showArrow')).toBe(true);
    expect(wrapper.props('disableSubjectCard')).toBeFalsy();

    /* SVGs not rendered in tests. Refer to README.md here for further explanation: https://gitlab.com/upchieve/subway
    expect(wrapper.contains('ArrowIcon')).toBe(true);
    const arrow = wrapper.find('ArrowIcon');
    expect(arrow.exists()).toBe(true);
    expect(arrow.isVisible()).toBe(true);
    expect(wrapper.find('svg')).toBe('MathSVG');
    */
  });
   
  //test for disabled recent subject card
  it('renders the recent subject button in the disabled state', () => {
    const wrapper = shallowMount(RecentSubjectCard, {
      propsData: SecondaryButton.args,
    });
   
    expect(wrapper.props('title')).toBe('Algebra 2');
    expect(wrapper.props('showArrow')).toBe(false);
    expect(wrapper.props('disableSubjectCard')).toBeTruthy();
  });
});
