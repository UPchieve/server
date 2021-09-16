import ReferenceForm from '@/components/ReferenceForm';
import { shallowMount } from '@vue/test-utils';

const getWrapper = (options = {}) => {
  options = {
    didSubmit: true,
    ...options
  };

  return shallowMount(ReferenceForm, {
    propsData: {
      didSubmit: options.didSubmit
    }
  });
};

describe("ReferenceForm", () => {
   it("layout", () => {
      const reference = getWrapper( { didSubmit: true });
      const referenceMessage = reference.find('.helper-message');
      expect(referenceMessage.exists()).toBe(true);
      expect(referenceMessage.text()).toBe('Reference submitted!');

      // const noReference = getWrapper( { didSubmit: false });
      // const noReferenceMessage = noReference.find('.helper-message');
      // expect(noReferenceMessage.exists()).toBe(true);
      // expect(noReferenceMessage.text()).toBe("Sorry, you've been removed as a reference.");
   })
});