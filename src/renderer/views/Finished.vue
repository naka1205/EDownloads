<template>
  <div class="app-container">
    <el-card class="box-card"  shadow="never" :body-style="{padding: '0'}">
      <div slot="header" class="card-header clearfix">
        <div class="right-button">
          <el-button type="text" @click="handleCloseAll()">{{ $t("message.finished.handleCloseAll") }}</el-button>
        </div>
      </div>
      <el-table 
        :data="tableData" 
        :empty-text='$t("message.status.empty")' 
        tooltip-effect="dark" 
        style="width:100%" 
        max-height="460" 
        :show-header="false" >
        <el-table-column align="left" width="40">
          <template slot-scope="scope">
            <i :class="scope.row.isTorrent | isTorrentFilter"></i>
          </template>
        </el-table-column>
        <el-table-column align="left" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="column-text">{{scope.row.name}}</div>
            <div class="column-info">{{scope.row.completed|sizeFilter}}/{{scope.row.total|sizeFilter}}</div>
          </template>
        </el-table-column>
        <el-table-column align="right" width="120">
          <template slot-scope="scope">
            <i size="small" class="handle el-icon-circle-close" @click="handleClose(scope.row)"></i>
            <i size="small" class="handle el-icon-folder-opened" @click="handleOpen(scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
  </div>
</template>

<script>
import Utils from '@/utils'

export default {
  name: 'Finished',
  data () {
    return {
      tableData: []
    }
  },
  filters: {
    isTorrentFilter(value) {
      return value ? 'el-icon-folder' : 'el-icon-document';
    },
    sizeFilter(value) {
      if (!value) return '--';
      return Utils.bytesToSize(value)
    }
    
  },
  mounted() {
    this.tableData = this.$client.completes
  },
  created() {

  },
  methods: {
     handleClose(data){
        this.$confirm(this.$t('message.finished.confirmTips'), this.$t('message.finished.confirmTitle'), {
          distinguishCancelAndClose: true,
          confirmButtonText: this.$t('message.finished.confirm'),
          cancelButtonText: this.$t('message.finished.cancel')
        }).then(async () => {
            // console.log('confirm')
            await this.$client.delete(data.gid,true)
            this.tableData = this.$client.completes
            this.$message({ type: 'info', message: this.$t('message.finished.confirmInfo')})
        }).catch(async (action) => {
            // console.log('cancel')
            if ( action === 'cancel' ) {
                await this.$client.delete(data.gid)
                this.tableData = this.$client.completes
                this.$message({ type: 'info', message: this.$t('message.finished.cancelInfo')})
            }
        })

    },
    async handleOpen(data){
      this.$remote.shell.showItemInFolder(data.path);
    },
    async handleCloseAll(){
        this.$confirm(this.$t('message.finished.confirmTips'), this.$t('message.finished.confirmTitle'), {
          distinguishCancelAndClose: true,
          confirmButtonText: this.$t('message.finished.confirm'),
          cancelButtonText: this.$t('message.finished.cancel')
        }).then(() => {
            this.$message({ type: 'info', message: this.$t('message.finished.confirmInfo')});
        }).catch(action => {
            if ( action === 'cancel' ) {
                this.$message({ type: 'info', message: this.$t('message.finished.cancelInfo')});
            }
        });
    }
  }
}
</script>
<style lang="scss" scoped>

.handle{
  font-size: 20px;
  margin-right:10px;
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
.column-info{
    font-size: 12px;
    color: #606266;
    min-height: 20px;
}
</style>