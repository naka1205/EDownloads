<template>
  <div class="app-container">
    <el-card class="box-card"  shadow="never" :body-style="{padding: '0'}">
      <div slot="header" class="card-header clearfix">
        <el-dropdown @command="handleAdd">
          <span class="el-dropdown-link">
            {{ $t("message.downloading.addTask") }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="item" v-for="(item,index) in types" :key="index">{{ $t("message.downloading")[item] }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="right-button">
          <el-button type="text" @click="handleAllPause">{{ $t("message.downloading.handleAllPause") }}</el-button>
          <el-button type="text" @click="handleAllClose">{{ $t("message.downloading.handleAllClose") }}</el-button>
        </div>
      </div>
      <el-table :data="tableData" :empty-text='$t("message.status.empty")' tooltip-effect="dark" style="width: 100%" max-height="460" :show-header="false" >
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
        <el-table-column align="center" width="100">
          <template slot-scope="scope">
            <div class="column-text">{{setStatus(scope.row)}}</div>
            <div class="column-info"> </div>
          </template>
        </el-table-column>
        <el-table-column align="left" width="180">
          <template slot-scope="scope">
            <div class="column-progress"><el-progress :stroke-width="12" :color="scope.row.code|colorFilter" :percentage="setProgress(scope.row)" :show-text="false"></el-progress></div>
            <div class="column-info">{{setTimes(scope.row)}}</div>
          </template>
        </el-table-column>
        <el-table-column align="right" width="120">
          <template slot-scope="scope">
            <i size="small" class="handle el-icon-caret-right" v-if="scope.row.code==2 | scope.row.code==3" @click="handleStart(scope.row)"></i>
            <i size="small" class="handle el-icon-video-pause" v-if="scope.row.code==0" @click="handlePause(scope.row)"></i>
            <i size="small" class="handle el-icon-circle-close" @click="handleClose(scope.row)"></i>
            <i size="small" class="handle el-icon-folder-opened" @click="handleOpen(scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </el-card>


    <el-dialog :title='$t("message.task.title")' :visible.sync="dialogAdd" :close-on-click-modal="false" width="60%">
      <div v-if="type==2||type==0">
        <el-input size="small" type="textarea" :placeholder='$t("message.task.ftpTips")' v-model="content"></el-input>
      </div>
      <div v-if="type==1">
        <el-input :placeholder='$t("message.task.torrentTips")' v-model="content" :disabled="true" size="small">
            <el-button slot="append" @click="handleFile">{{ $t("message.task.handleFile") }}</el-button>
        </el-input>
        <input id="torrent" type="file" accept=".torrent" @change="changeFile" style="display:none;"  />
      </div>
      <div v-if="type==3">
        <el-input :placeholder='$t("message.task.baiduTips")' v-model="content" size="small" class="input-with-code">
          <el-input slot="append" v-model="code" :placeholder='$t("message.task.codeTips")'></el-input>
        </el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogAdd = false">{{ $t("message.handle.close") }}</el-button>
        <el-button size="mini" type="primary" @click="dialogConfirm">{{ $t("message.handle.confirm") }}</el-button>
      </div>
    </el-dialog>
    
  </div>
</template>

<script>

import { mapState } from 'vuex'
import ParseTorrent from 'parse-torrent'
import Utils from '@/utils'
import fs from 'fs'

const defaultColors = ["#409EFF", "#737373", "#737373", "#FF6157","#2ACB42","#737373"]
const defaultTypes = ['ftp', 'torrent', 'magnet','baidu']

export default {
  name: 'Home',
  data () {
    return {
      content: '',
      code: '',
      type: '',
      types: defaultTypes,
      dialogAdd: false,
      tableData: []
    }
  },
  computed: {
    ...mapState([
      'token'
    ])
  },
  filters: {
    isTorrentFilter(value) {
      return value ? 'el-icon-folder' : 'el-icon-document';
    },
    sizeFilter(value) {
      if (!value) return '--';
      return Utils.bytesToSize(value)
    },
    colorFilter(value){
      return defaultColors[value]
    }
    
  },
  destroyed() {
    this.$ipcRenderer.removeAllListeners("update")
  },
  mounted() {
    this.$ipcRenderer.on("update", (event) => {
        this.tableData = this.$client.actives
    });
  },
  created() {
    this.tableData = this.$client.actives
  },
  methods: {
    setStatus(data){
      if (data.status != 'active' ) {
        return this.$t('message.status')[data.status]
      }

      return data.speed == 0 ? this.$t('message.status.speed') : Utils.bytesToSize(data.speed) + '/s'
    },
    setTimes(data) {
      if (data.speed <= 0) {
        return '--'
      }
      let times = Math.ceil((data.total - data.completed ) / data.speed)
      let format = {
          prefix:this.$t("message.remaining.prefix"),
          i18n: {
            'gt1d': this.$t('message.remaining.gt1d'),
            'hour': this.$t('message.remaining.hour'),
            'minute': this.$t('message.remaining.minute'),
            'second': this.$t('message.remaining.second')
          }
      }
      return Utils.timesFormat(times,format)
    },
    setProgress(data) {
      return Utils.calcProgress(data.total,data.completed)
    },
    handleAllPause(){

    },
    handleAllClose(){

    },
    async handlePause(data){
      await this.$client.pause(data.gid)
    },
    async handleStart(data){
      await this.$client.unpause(data.gid)
    },
    handleClose(data){
      this.$client.forceRemove(data.gid).then((data)=>{
          this.$message({ type: 'success', message: this.$t('message.handle.success')});
      }).catch(err => {
          this.$message({ type: 'error', message: this.$t('message.handle.error')});
          console.log("error", err)
      });
    },
    handleOpen(data){
      this.$shell.showItemInFolder(data.path);
    },
    handleAdd(type) {
        if (this.token == '' && type == 'baidu') {
          this.$store.commit('check',true)
          return
        }
        this.type = defaultTypes.findIndex(item =>item == type);
        if (this.type < 0) {
          return
        }
        this.dialogAdd = true
    },
    async dialogConfirm(){
        // console.log(this.type )
        if (this.type == 1) {
            let isfile = this.content.match(/^[a-zA-Z]:(((\\(?! )[^/:*?<>\""|\\]+)+\\?)|(\\)?)\s*$/g)
            if (isfile !== null && isfile.length > 0) {
                let file = document.querySelector('#torrent').files[0]
                let data = await Utils.fileToBase64(file)
                this.$client.torrent(this.content,data) && this.$router.push({path:'/torrent'}) 
                // console.log(data)
                this.content = ''
            }
            
            return
        }
        if (this.type == 2 && this.content.indexOf('magnet') >= 0) {
          // this.$client.magnet(this.content) && this.$router.push({path:'/torrent'})
          this.$client.magnet(this.content).then((data)=>{
              // console.log(data)
              // this.$router.push({path:'/magnet',query:{id:data}})
                this.dialogAdd = false
                this.content = ''
          })


          return
        }

        if ( this.type == 0 ) {
            let paths = this.content.split('/');
            let filename = paths.pop()
            if (!filename || filename.lastIndexOf(".") === -1) {
                this.$message({ type: 'info', message: this.$t('message.downloading.ftpError')})
                return
            }
            this.$client.addUri(this.content).then(()=>{
                this.dialogAdd = false
                this.content = ''
            })
            return
        }

        // if ( this.type == 3 ) {

        //   this.$client.thunder(this.content).then((data)=>{
        //       console.log('thunder',data)
        //   })
        //   return
        // }
        
        if ( this.type == 3 ) {
            let content = this.content.match(/1[A-Za-z0-9-_]+/);
            if(content == null || this.code ==''){
                return;
            }
            let surl = content[0].substring(1)

            this.$baidu.verify(surl,this.code).then((response)=>{
                if (response.errno == 0) {
                    this.content = ''
                    this.$router.push({path:'/share',query:{id:response.randsk}})
                }
            })

            return
        }
        
    },
    handleFile(){
      console.log('handleFile')
      document.querySelector('#torrent').click()
    },
    changeFile (val) {
      this.content = document.querySelector('#torrent').files[0].path
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
  padding: 0 20px;
}
.right-button{
  color: #606266;
  float: right;
  .el-button{
    padding: 3px 0;
    color: #606266;
  }
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
.el-icon-arrow-down {
  font-size: 12px;
}

.column-info{
    font-size: 12px;
    color: #606266;
    min-height: 20px;
}
.column-progress{
  margin: 5px 0;
}

.code-input{
  background-color: #fff;
}
</style>