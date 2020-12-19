<template>
    <div class="app-container">
      <webview id="authorize" ref="authorize" style="display:none" :src="authorize" useragent="Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko" partition="baidu"></webview>
      <el-dialog title="扫码登录" :before-close="closeDialog" :close-on-click-modal="false" :visible.sync="dialogQrcode" width="20%">
        <el-image style="width: 100%; height: 100%;" :src="qrcode" :fit="'fill'">
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
        <div class="footer">点击<el-button type="text" @click="refresh">刷新</el-button>二维码</div>
      </el-dialog>
    </div>
</template>
<script>
import fs from 'fs';
import Utils from '@/utils'

export default {
  props: {
    authorize: {
        type:String,
        default:'https://openapi.baidu.com/oauth/2.0/authorize'
    }
  },
  data: function () {
    return {
        qrcode:'',
        isPrint:false,
        webview:null,
        loading:null,
        dialogQrcode:false
    }
  },
  created() {
    console.log('created Token')
    
  },
  mounted() {
    console.log('mounted Token')
    this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
    });

    this.qrcode =''
    this.isPrint = false
    this.dialogQrcode = true

    this.webview = document.querySelector('webview')

    this.webview.addEventListener('dom-ready', () => {
        console.log('dom-ready')
        // this.webview.openDevTools()
        let script = "getCode('Verifier');function getCode(name){var ele=document.getElementById(name); console.log('getCode',ele);return ele!==null?ele.value:'';};"
        this.webview.executeJavaScript(script,false).then( async (code)=>{
            // console.log(code)
            if (code !== '') {
              this.isPrint = true
              await this.$baidu.login(code);
              this.loading.close();
              // console.log(code)
            }
            
        })
  
    })

    this.webview.addEventListener('console-message', (e) => {
        // console.log('message:', e.message)

        if (!this.isPrint && e.message.indexOf('drawArrays') > 0 ) {
            this.isPrint = true

            setTimeout( async ()=>{

                let data = await this.webview.printToPDF({landscape:true})
                this.qrcodes(data)

            },1000)

        }
    })
  },
  methods: {
      closeDialog(done){
          this.$confirm('取消登录将无法使用网盘, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
              done()
              this.$store.commit('check',false)
          }).catch(() => {

          })
      },
      refresh(){
          this.qrcode =''
          this.isPrint = false

          this.loading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
          })
          this.webview.reload()
      },
      toDataURL(img){

        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(img.width, img.height);
        let imageBytes = imageData.data;

        for (let j = 0, k = 0, jj = img.width * img.height * 4; j < jj; ) {
            imageBytes[j++] = img.data[k++];
            imageBytes[j++] = img.data[k++];
            imageBytes[j++] = img.data[k++];
            imageBytes[j++] = 255;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.putImageData(imageData, 0, 0);

        this.qrcode = canvas.toDataURL("image/png");

        this.loading.close()
        
        this.isPrint = false

      },
      async qrcodes(data){

          let loadingTask = await extendLib.getDocument({ data: data})
          let pdfDocument = await loadingTask.promise
          let page = await pdfDocument.getPage(1)
          let opList = await page.getOperatorList();
          // console.log(opList)
          let key = opList.fnArray.findIndex(item=>item == extendLib.OPS.paintJpegXObject || item == extendLib.OPS.paintImageXObject)

          if (key >= 0) {
            //key 541
            let op = opList.argsArray[key][0];
            let img = page.objs.get(op);
            this.toDataURL(img)
          }
          // console.log(opList.argsArray[key])
          

      }
  }
}
</script>
<style lang="scss" scoped>
.app-container{
  height: 100%;
  width: 100%;
}
.footer{
  text-align: center;
}
.image-slot{
  height: 100%;
  width: 100%;
  .el-icon-picture-outline{
    font-size: 30px;
    margin: 30% 40%;
  }
}
</style>
