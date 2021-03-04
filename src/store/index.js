import Vue from 'vue'
import Vuex from 'vuex'
import appModule from './modules/app'
import userModule from './modules/user'
import config from '../config'

Vue.use(Vuex)

// Vue devtools need to be set before initializing store and router
if (config.devtools) {
  Vue.config.devtools = true
}

export const storeOptions = {
  modules: {
    app: appModule,
    user: userModule
  }
}

export default new Vuex.Store(storeOptions)
