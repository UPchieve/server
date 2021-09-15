import LoadingMessage from '@/components/LoadingMessage'
import { shallowMount } from '@vue/test-utils'

//@todo check for mobile mode
describe("LoadingMessage", () => {
  it("layout", () => {
    const wrapper = shallowMount(LoadingMessage);
    expect(wrapper.classes("loading-container")).toBe(true);
    expect(wrapper.find(".loading-ellipsis").exists()).toBe(true);
    expect(wrapper.find(".interval-ellipsis").exists()).toBe(true);
  });
});