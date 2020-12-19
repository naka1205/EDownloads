<template>
    <scroll-bar>
      <el-menu default-active="1" mode="vertical" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
        <router-link to="/" id="sidebar-home" class="row">
          <el-menu-item index="1">
            <i class="el-icon-download"></i>
            <span slot="title">{{ $t("message.main.downloading") }}</span>
          </el-menu-item>
        </router-link>
        <router-link to="/finished" id="sidebar-finished" class="row">
          <el-menu-item index="2">
            <i class="el-icon-folder-checked"></i>
            <span slot="title">{{ $t("message.main.finished") }}</span>
          </el-menu-item>
        </router-link>
        <router-link to="/baiduwp" id="sidebar-baiduwp" class="row">
          <el-menu-item index="3">
            <i class="el-icon-upload"></i>
            <span slot="title">{{ $t("message.main.baiduwp") }}</span>
          </el-menu-item>
        </router-link>
        <router-link to="/settings" id="sidebar-settings" class="row">
          <el-menu-item index="4">
            <i class="el-icon-set-up"></i>
            <span slot="title">{{ $t("message.main.settings") }}</span>
          </el-menu-item>
        </router-link>
      </el-menu>
    </scroll-bar>
</template>

<script>
import ScrollBar from '@/components/ScrollBar/ScrollBar'
export default {
  components: { ScrollBar },
  data: function () {
    return {

    }
  },
  computed: {

  },
  methods: {

  }
}
</script>
<style lang="css" scoped>

</style>
