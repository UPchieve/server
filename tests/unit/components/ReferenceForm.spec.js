import ReferenceForm from '@/components/ReferenceForm';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import appModule from "@/store/modules/app";
import Vuex from "vuex";
import NetworkService from '../../../src/services/NetworkService';

const localVue = createLocalVue();
localVue.use(Vuex);

jest.mock('../../../src/services/NetworkService')

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

  //  it("mocks a method", () => {
  //   const mockSpy = jest.spyOn(ReferenceForm.methods, 'testMethod').mockImplementation(() => true);
  //   const wrapper = getWrapper({});
  //   expect(mockSpy).toHaveBeenCalled();
  //  });


   it("renders reference message", () => {
     NetworkService.checkReference.mockImplementationOnce(
       () => {
         return true;
       }
     )
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

     console.log("test2: isNoLongerReference, should be true :" + wrapper.vm.isNoLongerReference); //true, should be true
     console.log("test2: didSubmit, should be false: " + wrapper.vm.didSubmit); //false, should be false
      const msg = wrapper.find('.helper-message');
      expect(msg.exists()).toBe(true); 
      expect(msg.text()).toBe("Sorry, you've been removed as a reference.");
   });

   it("reference form", () => {
    const wrapper = getWrapper({ 
      isNoLongerReference: false 
    });
    
    console.log("test3: isNoLongerRef: " + wrapper.vm.isNoLongerReference); //true, should be false
     expect(wrapper.classes()).toContain('questions-container');
   
   });

   

});