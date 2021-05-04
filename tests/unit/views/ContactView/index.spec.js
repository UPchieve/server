import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuex from "vuex"
import userModule from "@/store/modules/user"
import ContactView from "@/views/ContactView"


const localVue = createLocalVue()
localVue.use(Vuex)

const getWrapper = (isAuthenticated = true, isVolunteer = false) => {
  const store = new Vuex.Store({
    modules: {
      user: {
        ...userModule,
        getters: {
          isAuthenticated: () => isAuthenticated,
          isVolunteer: () => isVolunteer
        }
      }
    }
  })

  return shallowMount(ContactView, { localVue, store })
}

describe("ContactView", () => {
  it("renders ContactView", () => {
    const wrapper = getWrapper(true, false);
    expect(wrapper.is(ContactView))
  })
})
