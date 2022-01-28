import { FEATURE_FLAGS } from '@/consts'
import config from "@/config";
import {UnleashClient} from "unleash-proxy-client";
import * as Sentry from '@sentry/browser'

export const unleash = new UnleashClient({
  url: `${config.serverRoot}/unleash-proxy`,
  appName: config.unleashName,
  environment: config.unleashName,
  refreshInterval: 30
})

/**
 *
 * This is to ensure reactivity for our feature flags by intercepting
 * unleash's polling response and saving the flags as application state
 *
 * Feature flags that have a default state of `true` and do not need to be toggled
 * again can likely be removed once cleanup of the related feature flag code has taken place.
 *
 * TODO: run an unleash proxy instead
 *
 */
export default {
  namespaced: true,
  state: {
    flags: {
      [FEATURE_FLAGS.REFER_FRIENDS]: false,
      [FEATURE_FLAGS.STUDENT_BANNED_STATE]: true,
      [FEATURE_FLAGS.DASHBOARD_REDESIGN]: false,
      [FEATURE_FLAGS.GATES_STUDY]: true,
      [FEATURE_FLAGS.DOWNTIME_BANNER]: false,
      [FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH]: false,
      [FEATURE_FLAGS.CHATBOT]: false,
    },
  },
  mutations: {
    setFeatureFlags: (state) => {
      Object.keys(FEATURE_FLAGS).forEach(key => {
        state.flags[key] = unleash.isEnabled(FEATURE_FLAGS[key])
      })
    }
  },
  actions: {
    async initUnleash({ commit, state }) {
      unleash.on('update', () => {
        commit('setFeatureFlags')
      })
      try {
        await unleash.start()
      } catch (err) {
        Sentry.captureException(err)
      }
    },
  },
  getters: {
    isReferFriendsActive: state => state.flags[FEATURE_FLAGS.REFER_FRIENDS],
    isStudentBannedStateActive: state =>
      state.flags[FEATURE_FLAGS.STUDENT_BANNED_STATE],
    isDashboardRedesignActive: state =>
      state.flags[FEATURE_FLAGS.DASHBOARD_REDESIGN],
    isGatesStudyActive: state => state.flags[FEATURE_FLAGS.GATES_STUDY],
    isDowntimeBannerActive: state => state.flags[FEATURE_FLAGS.DOWNTIME_BANNER],
    isAlgebraTwoLaunchActive: state =>
      state.flags[FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH],
    isChatbotActive: state => state.flags[FEATURE_FLAGS.CHATBOT],
  },
}
