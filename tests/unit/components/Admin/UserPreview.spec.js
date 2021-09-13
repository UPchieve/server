import { shallowMount } from '@vue/test-utils';

import UserPreview from '../../../src/components/Admin/UserPreview'

describe("UserPreview", ()=> {
  it("layout", () => {
    const wrapper = shallowMount(UserPreview);
  });

})
