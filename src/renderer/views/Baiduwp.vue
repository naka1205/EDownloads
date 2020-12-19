<template>
  <div class="app-container">
    <el-card class="box-card"  shadow="never" :body-style="{padding: '0'}">
      <div slot="header" class="card-header clearfix">
        <div v-if="username!=''" class="left-info">
          <el-popconfirm 
            :confirm-button-text='$t("message.popconfirm.confirm")' 
            :cancel-button-text='$t("message.popconfirm.cancel")' 
            :title='$t("message.popconfirm.title")' @confirm="logout">
            <span class="tags" slot="reference">{{ $t("message.baiduwp.username") }}:{{username}}</span>
          </el-popconfirm>
          
          <span class="tags">{{ $t("message.baiduwp.total") }}:{{total|sizeFilter}}</span>
          <span class="tags">{{ $t("message.baiduwp.used") }}:{{used|sizeFilter}}</span>
        </div>

        <div class="right-button">
          <el-button type="text" @click="handleDeleteAll" :disabled="this.selected.length==0">{{ $t("message.baiduwp.handleDelete") }}</el-button>
          <el-button type="text" @click="handleBack" :disabled="this.parents.length<=1">{{ $t("message.baiduwp.handleBack") }}</el-button>
        </div>
      </div>
      <el-table ref="multipleTable" 
        :data="tableData" 
        :empty-text='$t("message.status.empty")' 
        v-loading="loading" 
        tooltip-effect="dark" 
        style="width:100%" 
        max-height="460" 
        @selection-change="handleSelected">
        <el-table-column type="selection" width="60" align="center" ></el-table-column>
        <el-table-column :label='$t("message.baiduwp.type")' width="100" align="center">
          <template slot-scope="scope">
            <i :class="scope.row.isdir | isdirFilter"></i>
          </template>
        </el-table-column>
        <el-table-column prop="server_filename" :label='$t("message.baiduwp.name")' align="left" show-overflow-tooltip></el-table-column>
        <el-table-column prop="size" :label='$t("message.baiduwp.size")' align="center" width="140">
          <template slot-scope="scope">{{scope.row.size | sizeFilter}}</template>
        </el-table-column>
        <el-table-column width="100" :label='$t("message.baiduwp.operation")' align="center">
          <template slot-scope="scope">
            <el-button class="handle" v-if="scope.row.isdir==1" type="text" @click="handleOpen(scope.row)">{{ $t("message.baiduwp.handleOpen") }}</el-button>
            <el-button class="handle" v-if="scope.row.isdir==0" type="text" @click="handleDownload(scope.row)">{{ $t("message.baiduwp.handleDownload") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>

import { mapState } from 'vuex'
import Utils from '@/utils'

export default {
  name: 'Baiduwp',
  data () {
    return {
      used:0,
      total:0,
      loading: false,
      parents: [],
      selected: [],
      tableData: []
    }
  },
  computed: {
    ...mapState([
      'token',
      'username'
    ])
  },
  watch:{
    token(val,nVal){
      if (val != '') {
          this.getinfo()
          this.getLists('')
      }
    }
  },
  filters: {
    isdirFilter(value) {
      return value === 0 ? 'el-icon-document' : 'el-icon-folder';
    },
    sizeFilter(value) {
      return Utils.sizeFormat(value)
    }
  },
  destroyed() {
    // console.log('destroyed')
    this.$ipcRenderer.removeAllListeners("link")
  },
  mounted() {
    // console.log('mounted Baiduwp')
    if (this.token == '') {
        this.$store.commit('check',true)
    }
    this.$ipcRenderer.on("link", (event,info) => {
        let type = info.error == 0 ? 'success' : 'error'
        let message = info.error == 0 ? this.$t('message.handle.success') : this.$t('message.handle.error')
        this.$message({ type: type, message: message});
        // this.$notify({ type: type, message: info.name + message});
    })
  },
  created() {
    this.parents = []
    
    if (this.token != '') {
        this.getinfo()
        this.getLists('')
    }
  
  },
  methods: {
    getinfo(){
      this.$baidu.quota().then((data)=>{
          this.used = data.used
          this.total = data.total
      }).catch((error) => {
          console.log('quota error',error)
      })
    },
    getLists(path){
      this.loading = true
      this.$baidu.list(path).then((data)=>{
          this.tableData = data.list
          this.loading = false
      }).catch((error) => {
          console.log('list error',error)
      })
    },
    logout(){
        this.used = 0
        this.total = 0
        this.tableData = []
        this.$baidu.logout()
    },
    handleSelected(val){
      this.selected = val;
    },
    handleBack(){
      this.parents.pop()
      let path = this.parents.join('/');
      this.getLists(path) 
    },
    handleOpen(row){
      this.parents = row.path.split('/')
      this.getLists(row.path) 
    },
    handleDeleteAll(){
      let paths = []
      for (let i = 0; i < this.selected.length; i++) {
        paths.push(this.selected[i].path)
      }
      this.handleDelete(paths)
    },
    handleDelete(paths){
        let filelist = '['
        for (let i = 0; i < paths.length; i++) {
          filelist += '"' + paths[i] + '",'
        }

        filelist += ']'
        filelist = filelist.replace(",]", "]")

        let data = { filelist:`${filelist}`, async:1}
        this.$baidu.filemanager('delete',data).then((response)=>{
            let path = this.parents.join('/');
            if (response.errno == 0) this.getLists(path)
        })
    },
    handleDownload(row){
        this.$baidu.link([row.fs_id])
    }
  }
}
</script>
<style lang="scss" scoped>
.handle{
  padding: 3px 0
}
.tags{
  margin-right: 10px;
  font-size: 14px;
}
.card-header{
  padding: 0 10px;
}
.left-info{
  float: left;
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