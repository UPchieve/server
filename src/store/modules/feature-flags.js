import { FEATURE_FLAGS } from '@/consts'
import parseUnleashFeatureFlags from '@/utils/parse-unleash-feature-flags'

function handleUnleashOnLoad(event, { commit, state }) {
  const { responseURL, response } = event.target
  // intercept the unleash client's response and save flags to our store
  if (responseURL.match('unleash')) {
    const data = JSON.parse(response)
    commit('setFeatureFlags', parseUnleashFeatureFlags(data, state.flags))
  }
}

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
    setFeatureFlags: (state, flags) =>
      (state.flags = {
        [FEATURE_FLAGS.REFER_FRIENDS]: flags[FEATURE_FLAGS.REFER_FRIENDS],
        [FEATURE_FLAGS.STUDENT_BANNED_STATE]:
          flags[FEATURE_FLAGS.STUDENT_BANNED_STATE],
        [FEATURE_FLAGS.DASHBOARD_REDESIGN]:
          flags[FEATURE_FLAGS.DASHBOARD_REDESIGN],
        [FEATURE_FLAGS.GATES_STUDY]: flags[FEATURE_FLAGS.GATES_STUDY],
        [FEATURE_FLAGS.DOWNTIME_BANNER]: flags[FEATURE_FLAGS.DOWNTIME_BANNER],
        [FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH]:
          flags[FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH],
        [FEATURE_FLAGS.CHATBOT]: flags[FEATURE_FLAGS.CHATBOT],
      }),
  },
  actions: {
    async initInterceptor({ commit, state }) {
      const origOpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', event =>
          handleUnleashOnLoad(event, { commit, state })
        )
        origOpen.apply(this, arguments)
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
