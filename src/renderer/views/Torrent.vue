<template>
<div class="app-container">
  <el-card class="box-card"  shadow="never" :body-style="{padding: '0'}">
    <div slot="header" class="card-header clearfix">
      <span class="tags">{{title}}</span>
      <span class="tags">{{size|sizeFilter}}</span>
      <div class="right-button">
        <el-button type="text" @click="handleSave" :disabled="this.selected.length<=0">{{ $t("message.torrent.handleDownload") }}</el-button>
        <el-button type="text" @click="handleBack" :disabled="this.parents.length<=0">{{ $t("message.torrent.handleBack") }}</el-button>
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
      <el-table-column :label='$t("message.torrent.type")' width="100" align="center">
        <template slot-scope="scope">
          <i :class="scope.row.isdir | isdirFilter"></i>
        </template>
      </el-table-column>
      <el-table-column prop="name" :label='$t("message.torrent.name")' align="left" show-overflow-tooltip></el-table-column>
      <el-table-column prop="size" :label='$t("message.torrent.size")' align="center" width="140">
        <template slot-scope="scope">{{scope.row.size | sizeFilter}}</template>
      </el-table-column>
      <el-table-column width="100" :label='$t("message.torrent.operation")' align="center">
        <template slot-scope="scope">
          <el-button class="handle" v-if="scope.row.isdir==1" type="text" @click="handleOpen(scope.row)">{{ $t("message.torrent.handleOpen") }}</el-button>
          <el-button class="handle" v-if="scope.row.isdir==0" type="text" @click="handleDownload(scope.row)">{{ $t("message.torrent.handleDownload") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

</div>
</template>
<script>

import Utils from '@/utils'

export default {
  name: 'Torrent',
  data () {
    return {
      title: '',
      size: 0,
      loading: false,
      parents: [],
      selected: [],
      tableData: []
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
    this.$client.clear()
  },
  created() {
    this.title = this.$client.name
    this.size = this.$client.dataSize

    this.parents = [0]
    this.open(0)
  },
  methods: {
    open(pid){
        this.loading = true
        let data = this.$client.open(pid)
        data.sort( (a, b) => -(a.isdir - b.isdir) )
        this.tableData = data
        this.loading = false
    },
    handleSelected(data){
      this.selected = [];
      for (let i = 0; i < data.length; i++) {
        this.selected.push(data[i].id)
      }
    },
    handleSave(){
      // console.log(this.selected)
      for (let i = 0; i < this.selected.length; i++) {
          this.$client.select(this.selected[i])
      }
      this.$client.addTorrent().then((data)=>{
          this.$message({ type: 'success', message: this.$t('message.handle.success')});
      }).catch(err => {
          this.$message({ type: 'error', message: this.$t('message.handle.error')});
          console.log("error", err)
      });
    },
    handleBack(){
      let pid = this.parents[this.parents.length-1]
      this.parents.splice(-1,1)
      this.open(pid)
    },
    handleOpen(row){
      this.parents.push(row.pid)
      this.open(row.id)
    },
    handleDownload(row){
      // this.$client.select(row.id)

      if (!this.$client.select(row.id)) {
        this.$message({ type: 'error', message: this.$t('message.handle.error')});
        return
      }
      
      // console.log(this.$client.selected)

      this.$client.addTorrent().then((data)=>{
          this.$message({ type: 'success', message: this.$t('message.handle.success')});
      }).catch(err => {
          this.$message({ type: 'error', message: this.$t('message.handle.error')});
          console.log("error", err)
      });
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
</style>