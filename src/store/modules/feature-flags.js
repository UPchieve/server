import { FEATURE_FLAGS } from '@/consts'

/**
 *
 * This is a temporary solution to ensure reactivity for our feature flags
 * by intercepting unleash's polling response and saving the flags as application state
 *
 * TODO: run an unleash proxy instead
 *
 */
export default {
  namespaced: true,
  state: {
    flags: {
      [FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH]: false,
      [FEATURE_FLAGS.CHATBOT]: false,
    },
  },
  mutations: {
    setFeatureFlags: (state, flags) => (state.flags = flags),
  },
  actions: {
    async initInterceptor({ commit }) {
      const origOpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
          // intercept unleash clents response and save flags to our store
          if (this.responseURL.match('unleash')) {
            const data = JSON.parse(this.response)
            const flags = data.features.reduce(
              (obj, flag) => ((obj[flag.name] = flag.enabled), obj),
              {}
            )
            commit('setFeatureFlags', flags)
          }
        })
        origOpen.apply(this, arguments)
      }
    },
  },
  getters: {
    isAlgebraTwoLaunchActive: state =>
      state.flags[FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH],
    isChatbotActive: state => state.flags[FEATURE_FLAGS.CHATBOT],
  },
}
