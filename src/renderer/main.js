import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './App'
import router from './router'
import store from './store'

import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss'

import Storage from 'electron-store'

const storage = new Storage();

const electron = require('electron')
const remote = electron.remote
const setup = electron.remote.app.setup

Vue.prototype.$ipcRenderer = electron.ipcRenderer
Vue.prototype.$shell = electron.shell
Vue.prototype.$remote = remote
Vue.prototype.$client = remote.app.client
Vue.prototype.$baidu = remote.app.baidu
Vue.prototype.$defaults = remote.app.defaults
Vue.prototype.$setup = setup

Vue.prototype.$storage = storage
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueI18n)

const messages = {
  'zh-CN': { message: require('@/lang/zh-CN.json') },
  'en-US': { message: require('@/lang/en-US.json') }
}

const i18n = new VueI18n({
  locale: setup.lang,
  fallbackLocale: 'zh-CN',
  messages
})

new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>'
}).$mount('#app')
