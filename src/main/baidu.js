import { app } from 'electron';
import Http from './http'

class Baidu {
    constructor() {

        this.host = 'https://pan.baidu.com'
        this.shorturl = ''
        this.randsk = ''

        this.oauth = ''

        this.init()
    }

    async init(){
        let api = 'https://www.oyoula.com/api/baidu/oauth'
        let info = await this.request('GET',api)
        this.oauth = info.data
    }

    async login(code){

        let api = 'https://www.oyoula.com/api/baidu/token?code='+code
        let response = await this.request('GET',api)

        if (response.code != 200) {
            return false
        }

        app.token = {
            access : response.data.access_token,
            refresh : response.data.refresh_token
        }

        app.store.set('token',app.token)
        app.main.win.webContents.send('login',app.token.access)
        return true
        // this.token(code).then((response) =>{

        //     app.token = {
        //         access : response.access_token,
        //         refresh : response.refresh_token,
        //     }

        //     app.store.set('token',app.token)
        //     app.main.win.webContents.send('login',app.token.access)
        // }).catch(error => {
        //     console.log('login error:',error)
        // })
    }

    async link(fsidlist,name){
        let info = await this.filemetas(fsidlist)
        if (info.list.length==0) {
            app.main.win.webContents.send('link',{error:-1})
            return false
        }

        let setup = app.store.has('setup') ? app.store.get('setup') : app.setup
        
        let multicalls = []
        for (let i = 0; i < fsidlist.length; i++) {
            let key = info.list.findIndex(item=>item.fs_id==fsidlist[i])
            if (key >= 0 ) {
                let size = info.list[key].size

                let filename = info.list[key].filename
                let dlink  = info.list[key].dlink + "&access_token=" + app.token.access

                
                let opt = {
                    dir:setup.folder,
                    out:filename
                }
                // console.log(opt)
                if (size > 41943040) {
                    multicalls.push(["addUri", [dlink],opt])
                    continue 
                }
                // this.links[fsidlist[i]] = dlink
                let response = await Http.get(dlink)
                if (response.location !== undefined) {
                    multicalls.push(["addUri", [response.location],opt])
                }
            }
        }

        if (multicalls.length > 0) {
            app.client.multicall(multicalls)
        }
        
        app.main.win.webContents.send('link',{error:0})
        return true
  
    }

    logout(){

        app.token = {
            access : '',
            refresh :  ''
        }

        app.store.set('token',app.token)
        app.main.win.webContents.send('logout')
    }

    
    request(method,api,data=null){
        let opt = {
            method:method,
            url:api,
            data:data
        }
        return new Promise((resolve,reject) => {
            Http(opt).then((response) =>{
                resolve(response.data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    token(code){
        let api = 'https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&redirect_uri=oob&code=' + code
        api += '&client_secret=' + this.client_secret + '&client_id=' + this.client_id 
        return this.request('GET',api)
    }

    info(){
        let api = 'https://openapi.baidu.com/rest/2.0/passport/users/getInfo'
        return this.request('POST',api,{access_token:app.token.access})
    }

    quota(){
        let api = this.host + '/api/quota?access_token='+app.token.access
        return this.request('GET',api)
    }

    list(path){
        let dir = path ? '&dir=' + encodeURIComponent(path) : '&root=1'
        let api = this.host + '/api/list?access_token='+app.token.access + dir
        return this.request('GET',api)
    }

    folder(path){
        let dir = path ? '&dir=' + encodeURIComponent(path) : '&root=1'
        let api = this.host + '/api/list?folder=1&access_token='+app.token.access + dir
        return this.request('GET',api) 
    }

    create(data){
        let api = this.host + '/api/create?access_token='+app.token.access
        return this.request('POST',api,data)
    }

    filemetas(fsidlist,path=''){
        let fsids = fsidlist.length > 0 ? '['+fsidlist.join(',')+']' : '';
        let api = this.host + '/rest/2.0/xpan/multimedia?method=filemetas&dlink=1&access_token='+app.token.access
        api += '&fsids=' + fsids + (path == '' ? '' : '&path=' + path )
        return this.request('GET',api)
    }

    transfer(shareid,from,data){
        let api = this.host + '/rest/2.0/xpan/share?method=transfer&shareid='+shareid+'&from='+from+'&access_token='+app.token.access
        data.sekey = decodeURIComponent(this.randsk)
        return this.request('POST',api,data)
    }

    verify(surl,pwd){
        let api = this.host + '/rest/2.0/xpan/share?method=verify&surl='+surl
        let data = {
            pwd:pwd,
            third_type:9999,
            redirect:0
        }
        this.shorturl = surl
        return this.request('POST',api,data)
    }

    sharelist(randsk,dir){
        let api = this.host + '/rest/2.0/xpan/share?method=list&shorturl=' + this.shorturl + '&sekey=' + randsk
        api += dir == '' ? '&root=1' : '&root=0&dir=' + encodeURIComponent(dir)
        this.randsk = randsk
        return this.request('GET',api)
    }

    shorturlinfo(shareid,uk){
        let api = this.host + '/api/shorturlinfo?shorturl=' + shareid + '&uk=' + uk + '&spd=' + this.randsk
        return this.request('GET',api)
    }

    filemanager(opera,data){
        let api = this.host + '/rest/2.0/xpan/file?method=filemanager&opera=' + opera + '&access_token=' + app.token.access
        return this.request('POST',api,data)
    }

}

export default Baidu;