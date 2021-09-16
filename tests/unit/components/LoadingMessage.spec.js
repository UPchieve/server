import LoadingMessage from '@/components/LoadingMessage'
import { mount } from '@vue/test-utils'
//import getOperatingSystem from '@/utils/get-operating-system'

//@ todo: how to pass data to function that returns a wrapper
const getWrapper = propsData => mount(LoadingMessage, { propsData }
//   , {
//   data() {
//     return {
//       message: "loading message test"
//     }
//   }
// }
);

describe("LoadingMessage", () => {
  it("layout", () => {
    const wrapper = getWrapper({ isMobileAppIOS: false});
    expect(wrapper.classes("loading-container")).toBe(true);
   // const msg = wrapper.find('message').text();
    //expect(msg).toBe('loading message test');
    expect(wrapper.find(".interval-ellipsis").exists()).toBe(true);

    const wrapperMobile = getWrapper({ isMobileAppIOS: true, message: "loading message test"});
    expect(wrapperMobile.classes("loading-container")).toBe(true);
    expect(wrapperMobile.find(".loading-ellipsis").exists()).toBe(true);
  });

  it("mounted assigns intervalTimeoutId", () => {
    const wrapper = getWrapper ({isMobileAppIOS: true, message: "loading message test"});
    expect(wrapper.vm.intervalTimeoutId).not.toBe(undefined);
  })

  it("setInterval works and animatedEllipsis updates", () => {
    jest.useFakeTimers();
    //const operatingSystem = getOperatingSystem();
    const wrapper = getWrapper ({ isMobileApp: true, message: "loading message test"});

    expect(wrapper.vm.animatedEllipsis).toBe('');
    jest.advanceTimersByTime(500);
    // expect(wrapper.vm.animatedEllipsis).toBe('.');
    // jest.advanceTimersByTime(500);
    // expect(wrapper.vm.animatedEllipsis).toBe('..');
    // jest.advanceTimersByTime(500);
    // expect(wrapper.vm.animatedEllipsis).toBe('...');
    // jest.advanceTimersByTime(500);
    // expect(wrapper.vm.animatedEllipsis).toBe('');
  })

  it("instance gets destroyed", () => {
    //spying on functions lets us check if a function has been called or not --> test the internal logic
    const beforeDestroySpy = jest.spyOn(LoadingMessage, 'beforeDestroy');
    const wrapper = getWrapper({ isMobileApp: true, message: "loading message test"});
    // wrapper.vm.whenItStops = wrapper.vm.whenItStops - 1;
    // jest.advanceTimersByTime(500);
    // expect(beforeDestroySpy).toHaveBeenCalled();

    // @ todo: when is the timer stopping? so that we can mock the moment one interval before it stops?
    // @ todo: to update animatedEllipsis, how to mock the 'iOS' operating system
  })
});