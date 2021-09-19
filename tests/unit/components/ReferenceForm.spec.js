import ReferenceForm from '@/components/ReferenceForm';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from "vuex";

const localVue = createLocalVue();
localVue.use(Vuex);

const getWrapper = (options = {}) => {
  options = {
    didSubmit: true,
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
   it("layout", () => {
      const wrapper = getWrapper({ });
      const referenceMessage = wrapper.find('.helper-message');
      expect(referenceMessage.exists()).toBe(true);
      expect(referenceMessage.text()).toBe('Reference submitted!');

  //    const container = getWrapper({})
  //    container.setProps({isAdminReview: true})
  //    console.log(contain)
  //  // expect(container.find('.admin-review').exists()).toBe(true);
  //  //  expect(container.find('.heading-legend').exists()).toBe(true);
     
   })

   it("renders reference message", () => {
    const wrapper = getWrapper({});
    const msg = wrapper.find('.helper-message');
    expect(msg.exists()).toBe(true);
    expect(msg.text()).toBe('Reference submitted!');
   });

   it("renders not a reference message", () => {
    const wrapper = getWrapper({ 
      didSubmit: false, 
      isNoLongerReference: true
    });
    const msg = wrapper.find('.helper-message');
     expect(msg.exists()).toBe(true);
  //   console.log(wrapper.vm.didSubmit);
     //why failing here?
   expect(msg.text()).toBe("Sorry, you've been removed as a reference.");
   });

});