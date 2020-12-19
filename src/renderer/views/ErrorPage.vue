<template>
<div class="app-main">
  <div class="content">
      <h2>Error</h2>
      <div class="footer">点击<el-button type="text" @click="home">返回</el-button>首页</div>
  </div>
</div>
</template>

<script>

export default {
  name: 'ErrorPage',
  data: function () {
    return {
      selected: {}
    }
  },
  computed: {

  },
  methods: {
    home(){
      this.$router.push({path:'/'})
    }
  }
}
</script>
<style lang="scss" scoped>
.content{
  margin: 0 auto;
  height: 300px;
  width: 300px;
  line-height: 100px;
}
</style>
