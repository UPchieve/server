import ReferenceForm from '@/components/ReferenceForm';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import appModule from "@/store/modules/app";
import Vuex from "vuex";

const localVue = createLocalVue();
localVue.use(Vuex);

const getWrapper = (mobileMode = false, options = {}) => {
  const store = new Vuex.Store({
    modules: {
      app: {
        ...appModule,
        getters: {
          mobileMode: () => mobileMode
        }
      }
    }});

  options = {
    didSubmit: false,
    isNoLongerReference: false,
    isAdminReview: false,
    affiliation: '',
    relationshipLength: '',
    rejectionReason: '',
    additionalInfo: '',
    ...options
  };

  return shallowMount(ReferenceForm, {
    localVue,
    store,
    propsData: {
      isAdminReview: options.isAdminReview
    },
    data() {
      return {
        didSubmit: options.didSubmit,
        isNoLongerReference: options.isNoLongerReference,
        affiliation: options.affiliation,
        relationshipLength: options.relationshipLength,
        rejectionReason: options.rejectionReason,
        additionalInfo: options.additionalInfo
      }    
    }
  });
};

describe("ReferenceForm", () => {
  let wrapper
  beforeEach(() => {
      wrapper = getWrapper({});
  })

  it("should init to a valid Vue instance", () => {
    expect(wrapper.isVueInstance()).toBe(true);
  });

  //  it("layout", () => {
  //     const wrapper = getWrapper({didSubmit: true });
  //     const referenceMessage = wrapper.find('.helper-message');
  //     expect(referenceMessage.exists()).toBe(true);
  //     expect(referenceMessage.text()).toBe('Reference submitted!');

  // //    const container = getWrapper({})
  // //    await container.setProps({isAdminReview: true})
  // //    console.log(contain)
  // //  // expect(container.find('.admin-review').exists()).toBe(true);
  // //  //  expect(container.find('.heading-legend').exists()).toBe(true);
     
  //  });

   it("renders reference message", () => {
    const wrapper = getWrapper({ didSubmit: true });
    const msg = wrapper.find('.helper-message');
  
    console.log("test1: isNoLongerReference, should be false :" + wrapper.vm.isNoLongerReference); //true?? 
    console.log("test1: didSubmit, should be true: " + wrapper.vm.didSubmit); //false??

    expect(msg.exists()).toBe(true);
    console.log("form is submitted: " + wrapper.html())
    expect(msg.text()).toBe('Reference submitted!');
   });

   it("renders not a reference message", () => {
    const wrapper = getWrapper({ 
      isNoLongerReference: true
    });
    // console.log(wrapper.vm.didSubmit); //currently: 
     console.log("test2: isNoLongerReference, should be true :" + wrapper.vm.isNoLongerReference); //true, should be true
     console.log("test2: didSubmit, should be false: " + wrapper.vm.didSubmit); //false, should be false
      const msg = wrapper.find('.helper-message');
      expect(msg.exists()).toBe(true); 
      expect(msg.text()).toBe("Sorry, you've been removed as a reference.");
      // @todo: access classes inside wrapper? why is wrapper.classes() = []
      //
   });

   it("reference form", () => {
    const wrapper = getWrapper({ 
      isNoLongerReference: false 
    });
    // console.log(wrapper.html());
    // console.log(wrapper.classes());
    //console.log(wrapper.vm.didSubmit); //false, should be false
   
    
    console.log("test3: isNoLongerRef: " + wrapper.vm.isNoLongerReference); //true, should be false
     expect(wrapper.classes()).toContain('questions-container');
   
   });

   

});