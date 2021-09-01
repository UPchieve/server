import { shallowMount, createLocalVue } from "@vue/test-utils";
import { merge } from "lodash";
import Vuex from "vuex";
import { storeOptions } from "@/store";
import AppHeader from "@/components/App/AppHeader";
import HeaderTemplate from "@/components/App/AppHeader/HeaderTemplate";
import DefaultHeader from "@/components/App/AppHeader/DefaultHeader";
import RejoinSessionHeader from "@/components/App/AppHeader/RejoinSessionHeader";
import BannedStudentHeader from "@/components/App/AppHeader/BannedStudentHeader";
import { HEADER_STATES } from "../../../../../src/consts";

const localVue = createLocalVue();
localVue.use(Vuex);

const getWrapper = (state = {}) => {
  const store = new Vuex.Store(
    merge({}, storeOptions, {
      modules: { app: { modules: { header: { state } } } }
    })
  );

  return shallowMount(AppHeader, { localVue, store });
};

describe("AppHeader", () => {
  it("renders HeaderTemplate", () => {
    const state = { data: { headerState: HEADER_STATES.ACTIVE_SESSION } };
    const wrapper = getWrapper(state);
    const modal = wrapper.find(HeaderTemplate);
    expect(modal.exists()).toBe(true);
    expect(modal.props().headerState).toEqual(state.data.headerState);
  });

  it("renders DefaultHeader", () => {
    const state = { component: "DefaultHeader", data: {} };
    const wrapper = getWrapper(state).find(HeaderTemplate);
    const modal = wrapper.find(DefaultHeader);
    expect(modal.exists()).toBe(true);
    expect(modal.attributes("header-data")).toBeDefined();
  });

  it("renders RejoinSessionHeader", () => {
    const state = { component: "RejoinSessionHeader", data: {} };
    const wrapper = getWrapper(state).find(HeaderTemplate);
    const modal = wrapper.find(RejoinSessionHeader);
    expect(modal.exists()).toBe(true);
    expect(modal.attributes("header-data")).toBeDefined();
  });

  it("renders BannedStudentHeader", () => {
    const state = { component: "BannedStudentHeader", data: {} };
    const wrapper = getWrapper(state).find(HeaderTemplate);
    const modal = wrapper.find(BannedStudentHeader);
    expect(modal.exists()).toBe(true);
    expect(modal.attributes("header-data")).toBeDefined();
  });
});
