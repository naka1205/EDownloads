import Vue from 'vue'
import Vuex from 'vuex'
import {remote} from "electron";
Vue.use(Vuex)

const token = remote.app.token.access

export default new Vuex.Store({
  state: {
    isOauth:token==='',
    token:token,
    username:'',
    openid:'',
    total:0,
    used:0,
  },
  mutations: {
    check(state, data){
      state.isOauth = data
    },
    login(state, data){
      state.token = data.token
      state.openid = data.openid
      state.username = data.username
      state.isOauth = false
    },
    logout(state){
      state.token = ''
      state.openid = ''
      state.username = ''
    }
  },
  actions: {
  },
  modules: {
  }
})
