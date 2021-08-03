import { shallowMount } from '@vue/test-utils';

import RecentSubjectCard from '../../../src/views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'
import ArrowIcon from '../../../src/assets/arrow.svg';


//👇 Imports a specific story for the test
import { PrimaryButton, SecondaryButton } from '../../../src/stories/RecentSubjectCard.stories';


//test for default recent subject card -> this test fails
// @todo: figure out why checking for svg object is failing when it exists; unit testing for component tags?
describe("RecentSubjectCard", () => {
  it('renders recent subject card', () =>{
    const wrapper = shallowMount(RecentSubjectCard, {
      propsData: PrimaryButton.args,
      stubs: [ArrowIcon],
      attachTo: true
    });

    // JSDOM issue: comment by danny nicholas: https://github.com/vuejs/vue-test-utils/issues/369
    // https://github.com/visualfanatic/vue-svg-loader/issues/38
    // https://github.com/cristijora/vue-test-utils-jest-example
    // vue-svg-loader: jest.config.vue.js https://gitmemory.com/issue/visualfanatic/vue-svg-loader/38/488450538
    // not tried: https://forum.vuejs.org/t/unit-testing-using-jest-shallow-rendering-not-shallow/30049/2
   // adding svg image as a stub: https://github.com/vuejs/vue-jest/issues/202
   // VVV similar example: http://5.9.10.113/59568980/dynamic-component-with-svg-not-rendering-in-jest-snapshot dynamic component + svg
    expect(wrapper.html()).to.contain('svg');
    console.log(wrapper.html());
  
    expect(wrapper.is(RecentSubjectCard));
    expect(wrapper.props('title')).toBe('Algebra 1');
    expect(wrapper.find(".SubjectCard-desktop-column").exists()).toBe(true);

    
    expect(wrapper.contains(ArrowIcon)).toBe(true);
    const arrow = wrapper.find('ArrowIcon');
    console.log(arrow);
    expect(arrow.exists()).toBe(true);
    expect(arrow.isVisible()).toBe(true);
  
    
    expect(wrapper.find('svg')).toBe('MathSVG');
    wrapper.destroy();
    
  });
   
  //test for disabled recent subject card -> this test passes
  it('renders the recent subject button in the disabled state', () => {
    const wrapper = shallowMount(RecentSubjectCard, {
      propsData: SecondaryButton.args,
    });
    console.log(wrapper.html());
    expect(wrapper.props('title')).toBe('Algebra 2');
    expect(wrapper.find('disableSubjectCard')).toBeTruthy();
    expect(wrapper.find('ArrowIcon').exists()).toBeFalsy();
  });
});
