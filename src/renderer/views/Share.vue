<template>
<div class="app-container">
  <el-card class="box-card"  shadow="never" :body-style="{padding: '0'}">
    <div slot="header" class="card-header clearfix">
      <span class="tags">ID:{{share_id}}</span>
      <span class="tags">UK:{{uk}}</span>
      <span class="tags">{{title}}</span>
      <div class="right-button">
        <el-button type="text" @click="handleSave" :disabled="this.selected.length<=0">{{ $t("message.baiduwp.handleSave") }}</el-button>
        <el-button type="text" @click="handleBack" :disabled="this.parents.length<=0">{{ $t("message.baiduwp.handleBack") }}</el-button>
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
          <el-button class="handle" v-if="scope.row.isdir==0" type="text" @click="handleTransfer(scope.row)">{{ $t("message.baiduwp.handleTransfer") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog :title='$t("message.baiduwp.transfer")' :visible.sync="dialogFolder">
    <div class="dialog-tree">
      <el-tree
        :data="folders"
        :check-strictly="true"
        :lazy="true"
        :load="loadFolders"
        :empty-text='$t("message.status.empty")' 
        v-loading="loadfolder"
        node-key="id"
        ref="tree"
        icon-class="el-icon-folder"
        accordion
        show-checkbox
        highlight-current
        @check-change="handleClick"
        :props="defaultFolders">
      </el-tree>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogFolder = false">{{ $t("message.handle.close") }}</el-button>
      <el-button size="mini" type="primary" @click="dialogConfirm">{{ $t("message.handle.confirm") }}</el-button>
    </div>
  </el-dialog>

</div>
</template>
<script>

import Utils from '@/utils'

export default {
  name: 'Share',
  data () {
    return {
      title: '',
      uk: '',
      share_id: '',
      randsk: '',
      parents: [],
      loading: false,
      loadfolder: false,
      folder:0,
      folderid:0,
      folders: [],
      selected: [],
      tableData: [],
      defaultFolders: {
          children: 'children',
          label: 'label'
      },
      dialogFolder:false
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

  },
  created() {
    // console.log('created Share')
    
    this.shorturl = this.$baidu.shorturl
    this.randsk = decodeURIComponent(this.$route.query.id)

  },
  mounted() {
    this.parents = ['']
    this.open('')
  },
  methods: {
    open(path){
        this.loading = true
        this.$baidu.sharelist(this.randsk,path).then((response)=>{
            
            if (path == '' ) {
              this.title = response.title
              this.share_id = response.share_id
              this.uk = response.uk
            }
            this.tableData = response.list

            this.loading = false
        })
    },
    handleSelected(data){
      this.selected = [];
      for (let i = 0; i < data.length; i++) {
        this.selected.push(data[i].fs_id)
      }
    },
    handleBack(){
      this.parents.splice(-1,1)
      let path = this.parents[this.parents.length-1]
      this.open(path)
    },
    handleOpen(row){
      this.parents.push(row.path)
      this.open(row.path)
    },
    handleSave(){
      this.checkedFolder = ''
      this.dialogFolder = true
    },
    handleTransfer(row){

      this.selected = [];
      this.selected.push(row.fs_id)

      this.checkedFolder = ''
      this.dialogFolder = true

    },
    handleClick(data, checked, node){
      if(checked == true){
        this.checkedFolder= data.value;
        this.$refs.tree.setCheckedNodes([data]);
      }
    },
    loadFolders(node, resolve){
      this.loadfolder = true
      let path = node.data.value == undefined ? '' : node.data.value
      this.$baidu.folder(path).then((data)=>{
          let folders = []
          for (let i = 0; i < data.list.length; i++) {
            this.folderid++
            let value = data.list[i].path
            let name = value.split('/')
            let folder = {
              id:this.folderid,
              value:value,
              label:name[name.length-1]
            }
            folders.push(folder)
          }

          resolve(folders)
          this.loadfolder = false

      }).catch((error) => {
          console.log('list error',error)
      })
    },
    dialogConfirm(){
      if (this.checkedFolder == '') {
        this.$message({ type: 'error', message: this.$t('message.baiduwp.select')});
        return
      }

      // let path = encodeURIComponent(this.checkedFolder)

      let data = {
          fsidlist:'['+this.selected.join(',')+']',
          path:this.checkedFolder
      }
      this.$baidu.transfer(this.share_id,this.uk,data).then((response)=>{
        this.checkedFolder = ''
        this.dialogFolder = false
        let type = response.errno == 0 ? 'success' : 'error'
        let message = response.errno == 0 ? this.$t('message.handle.success') : this.$t('message.handle.error')
        this.$message({ type: type, message: message});
      })
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
.right-button{
  color: #606266;
  float: right;
  .el-button{
    padding: 3px 0;
    color: #606266;
  }
}

.dialog-tree{
  // width: 100%;
  max-height: 400px;
  padding:5px 0;
  box-sizing: border-box;
  overflow-y: scroll;
}
</style>