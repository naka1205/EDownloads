<template>
  <div class="app-wrapper">
    <sidebar class="sidebar-container"></sidebar>
    <div class="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import Sidebar from '@/components/Sidebar/Sidebar'

export default {
  name: 'Layout',
  components: { Sidebar },
  data: function () {
    return {
      isDesktop: false
    }
  },
  created() {
    console.log('created Layout')
  },
  methods: {

  }
}
</script>
<style lang="scss" type="text/css" scoped>
  .app-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>