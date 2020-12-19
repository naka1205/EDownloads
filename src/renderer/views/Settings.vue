<template>
  <div class="app-container">
    <el-card class="box-card"  shadow="never" :body-style="{padding: '0'}">
      <div slot="header" class="card-header clearfix">
        <div class="right-button">
          <el-button type="text" @click="handleReset()">{{ $t("message.settings.handleReset") }}</el-button>
          <el-button type="text" @click="handleSave()">{{ $t("message.settings.handleSave") }}</el-button>
        </div>
      </div>
      <div class="form">
        <el-form ref="form" :model="form" label-width="120px" size="small">
          <el-form-item :label='$t("message.settings.lang")'>
            <el-select v-model="form.lang" :placeholder='$t("message.settings.langTips")'>
              <el-option label="简体中文" value="zh-CN"></el-option>
              <el-option label="English" value="en-US"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label='$t("message.settings.folder")'>
            <el-input :placeholder='$t("message.settings.folderTips")' v-model="form.folder" :disabled="true" class="input-with">
                <el-button slot="append" @click="handleFolder">{{ $t("message.settings.handleFolder") }}</el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
    </el-card>
    
  </div>
</template>

<script>
import Utils from '@/utils'

export default {
  name: 'Settings',
  data () {
    return {
      form: Object.assign({}, this.$setup)
    }
  },
  filters: {

  },
  computed: {

  },
  destroyed() {

  },
  mounted() {
    this.form = Object.assign({}, this.$setup)
  },
  created() {
    console.log('created Settings')
  },
  methods: {
      handleReset(){
        this.form = Object.assign({}, this.$defaults)
      },
      handleSave() {
        this.$i18n.locale = this.form.lang
        this.$storage.set('setup',this.form)
        this.$message({ type: 'success', message: this.$t('message.handle.success')})
      },
      handleFolder(){
        this.$remote.dialog.showOpenDialog({
          properties: ['openDirectory', 'createDirectory']
        }).then(({ canceled, filePaths }) => {
          if (canceled || filePaths.length === 0) {
            this.$message({ type: 'error', message: this.$t('message.handle.error')})
            return
          }

          const [path] = filePaths
          this.form.folder = path
        })
      }
  }
}
</script>
<style lang="scss" scoped>
.form{
  padding: 20px;
}
.card-header{
  padding: 0 10px;
}
.right-button{
  color: #606266;
  float: right;
  .el-button{
    padding: 3px 0;
    color: #606266;
  }
}
</style>