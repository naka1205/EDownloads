<template>
  <div id="app">
    <token :authorize="$baidu.oauth" v-if="isOauth"></token>
    <router-view></router-view>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import Token from '@/components/Token/Token'

export default {
  name: 'App',
  components: { Token },
  computed: {
    ...mapState([
      'token',
      'isOauth'
    ])
  },
  data: function () {
    return {
      
    }
  },
  created() {
    console.log('created App')
    if (this.token!='') {
      this.login(this.token)
    }

    this.$ipcRenderer.on("login", async (event,data) => {
        this.login(data)
    })

    this.$ipcRenderer.on("logout", (event) => {
        console.log('logout')
        this.$store.commit('logout')
        // this.isOauth = true
    })

  },
  destroyed(){
    console.log('destroyed App')
  },
  methods: {
    async login(token){
      let info = await this.$baidu.info()
      let data = {
          token:token,
          username:info.username,
          openid:info.openid
      }
      this.$store.commit('login',data)
    },
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body { font-family: 'Source Sans Pro', sans-serif; max-width: 100%;}
</style>