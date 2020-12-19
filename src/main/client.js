import { app, shell } from 'electron';
import Aria2 from 'aria2'
import ParseTorrent from 'parse-torrent'
import Fs from 'fs'

const kebabCase = require('lodash.kebabcase');

const defaultTask = {
    id:0,
    gid: '',
    name: '',
    path: '',
    size: 0,
    total: 0,
    completed: 0,
    speed: 0,
    status: ''
}

const defaultStatus = ['active', 'waiting', 'paused', 'error', 'complete', 'removed']

class Client {

    constructor() {

        let options = {
            host: 'localhost',
            port: 6800,
            secure: false,
            secret: '',
            path: '/jsonrpc'
        }
        this.aria2 = new Aria2(options)
        
        this.timer = null
        this.interval = 1000
        this.isUpdate = false

        this.actives = []
        this.waitings = []
        this.completes = []

        this.fid = 0
        this.name = ''

        this.files = []
        this.selected = []

        this.dataSize = 0
        this.dataBase64 = ''
    }

    startUpdate () {
        this.timer = setTimeout(() => {
            this.polling()
            this.startUpdate()
        }, this.interval)
    }

    polling () {
        if ( this.isUpdate ) {
            this.update()
        }
    }

    stopUpdate () {
        clearTimeout(this.timer)
        this.timer = null
    }

    async start(){

        this.aria2.open().then(() => {
            console.log("Client open")
            this.isUpdate = true
            this.startUpdate()
            this.waiting()
            this.complete()
        }).catch(err => {
            console.log("Client open error", err)
        });

        this.initOn()

    }

    

    stop(){

        this.isUpdate = false
        this.stopUpdate()
        this.aria2.removeAllListeners()

        this.aria2.close().then(() => {
            console.log("Client close")
        }).catch(err => {
            console.log("Client close error", err)
        });

        
    }

    initOn(){

        this.aria2.on("output", m => {
            // console.log("Client OUT", m);
        })
        
        this.aria2.on("input", m => {
            // console.log("Client IN", m);
        })

        this.aria2.on('onDownloadStart', async (event) => {
            console.log('Client onDownloadStart', event)
            this.waiting()
        })

        this.aria2.on('onDownloadPause', async (event) => {
            console.log('Client onDownloadPause', event)
            this.waiting()
        })

        this.aria2.on('onDownloadStop', async (event) => {
            console.log('Client onDownloadStop', event)
            this.waiting()
        })

        this.aria2.on('onDownloadComplete', async (event) => {
            console.log('Client onDownloadComplete', event)
            this.complete()
        })

        this.aria2.on('onDownloadError', async (event) => {
            console.log('Client onDownloadError', event)
            this.complete()
        })
    }

    async waiting(){
        // console.log('waiting')
        this.waitings = []
        let results = await this.tellWaiting(-1,20)
        
        for (let i = 0; i < results.length; i++) {
            // console.log(results[i])
            let info = await this.getOption(results[i].gid)
            // console.log(info)
            let task = this.newTask(results[i])
            this.waitings.push(task)
        }
    }

    async complete(){
        // console.log('complete')
        this.completes = []
        let results = await this.tellStopped(-1,20)
        for (let i = 0; i < results.length; i++) {
            let task = this.newTask(results[i])
            this.completes.push(task)
        }
    }

    async update(){
        // console.log('update')
        let actives = []
        let results = await this.tellActive()
        for (let i = 0; i < results.length; i++) {
            // console.log(results[i])
            let task = this.newTask(results[i])
            actives.push(task)
        }

        this.actives = []
        this.actives = this.actives.concat(actives).concat(this.waitings)

        app.main.win.webContents.send('update')
    }

    newFiles(files){
        let data = []
        for (let i = 0; i < files.length; i++) {
            let paths = files[i].path.split("/")
            let file = {
                id:files[i].index,
                size:files[i].length,
                selected:files[i].selected,
                filename:paths[paths.length-1]
            }
            data.push(file)
            
        }

        return data
    }

    newTask(data){
        let task = Object.assign({}, defaultTask)

        let code = defaultStatus.findIndex(item =>item == data.status)

        let isTorrent = this.isTorrent(data)
        let name = isTorrent ? data.bittorrent.info.name : this.getFileName(data.files[0].path)

        let files = isTorrent && code != 0 ? this.newFiles(data.files) : []

        task.gid = data.gid
        task.path = data.dir
        
        task.size = data.pieceLength
        task.speed = data.downloadSpeed
        task.total = data.totalLength
        task.completed = data.completedLength
        task.name = name
        task.code = code
        task.status = data.status
        task.isTorrent = isTorrent
        task.files = files

        return task
    }

    isTorrent(file) {
        return file.hasOwnProperty("bittorrent") && file.bittorrent.hasOwnProperty("info")
    }

    getFileName(path){
        let paths = path.split('/')
        return decodeURIComponent(paths[paths.length - 1])
    }

    addUri(uri,name ='',path=''){
        let setup = app.store.has('setup') ? app.store.get('setup') : app.setup
        let opt = {
            dir : path != '' ? path : setup.folder
        }

        if ( name != '') {
            opt.out = name
        }

        return new Promise((resolve,reject) => {
            this.aria2.call("addUri",[uri],this.kebabCase(opt)).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    kebabCase(opt){
        const result = {}

        Object.keys(opt).forEach((key) => {
          const kebabCaseKey = kebabCase(key)
          result[kebabCaseKey] = `${opt[key]}`
        })
        return result
    }

    addTorrent(name='',path=''){

        let setup = app.store.has('setup') ? app.store.get('setup') : app.setup
        let opt = {
            dir : path != '' ? path : setup.folder
        }

        if ( name != '') {
            opt.out = name
        }

        // opt.split = 64

        // opt.showFile = true
        if (this.selected.length > 0) {
            this.selected.sort((a,b)=>a - b);
            opt.selectFile = this.selected.join(',')
        }

        return new Promise((resolve,reject) => {
            this.aria2.call("addTorrent",this.dataBase64,[],this.kebabCase(opt)).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    tellStatus(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("tellStatus",gid).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    multicall(multicall){
        return new Promise((resolve,reject) => {
            this.aria2.multicall(multicall).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    tellWaiting(offset, num){
        return new Promise((resolve,reject) => {
            this.aria2.call("tellWaiting",offset, num).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    tellStopped(offset, num){
        return new Promise((resolve,reject) => {
            this.aria2.call("tellStopped",offset, num).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    tellActive(){
        return new Promise((resolve,reject) => {
            this.aria2.call("tellActive").then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    getFiles(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("getFiles",gid).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    getOption(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("getOption",gid).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    pause(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("pause",gid).then((data) =>{
                this.waiting()
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    unpause(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("unpause",gid).then((data) =>{
                this.waiting()
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    forcePause(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("forcePause",gid).then((data) =>{
                this.waiting()
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    remove(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("remove",gid).then((data) =>{
                resolve(data)
                this.waiting()
                this.complete()
            }).catch(err => {
                reject(err)
            });
        })
    }

    forceRemove(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("forceRemove",gid).then((data) =>{
                resolve(data)
                this.waiting()
                this.complete()
            }).catch(err => {
                reject(err)
            });
        })
    }

    async delete(gid,isFile=false){

        if ( isFile == true) {
            let file = await this.getFiles(gid)
            // console.log(file[0].path)
            file && file.length>0 && shell.moveItemToTrash(file[0].path)
        }

        let results = await this.removeDownloadResult(gid)
        if (results == 'OK') {
            this.complete()
        }

        return results
    }

    removeDownloadResult(gid){
        return new Promise((resolve,reject) => {
            this.aria2.call("removeDownloadResult",gid).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    show(gid){
        return this.waitings.filter( item =>item.gid == gid )
    }

    // thunder(uri){
    //     let setup = app.store.has('setup') ? app.store.get('setup') : app.setup
    //     let opt = {}
    //     opt.dir = setup.folder
    //     return new Promise((resolve,reject) => {
    //         this.aria2.call("addUri",[uri],this.kebabCase(opt)).then((data) =>{
    //             resolve(data)
    //         }).catch(err => {
    //             reject(err)
    //         });
    //     })
    // }

    magnet(uri){

        let setup = app.store.has('setup') ? app.store.get('setup') : app.setup

        let opt = {}
        opt.dir = setup.folder
        // opt.showFiles = true

        return new Promise((resolve,reject) => {
            this.aria2.call("addUri",[uri],this.kebabCase(opt)).then((data) =>{
                resolve(data)
            }).catch(err => {
                reject(err)
            });
        })
    }

    torrent(path,data){
        // console.log(data)
        let info = ParseTorrent(Fs.readFileSync(path))
        this.fid = 1
        this.name = info.name
        this.files = []
        // console.log(info.files)
        for (let i = 0; i < info.files.length; i++) {
            this.parses(info.files[i],i+1)
        }
        
        this.dataSize = info.length
        this.dataBase64 = data
        return true
    }

    parses(file,index){
        let pid = 0
        let dirs = file.path.replace(this.name + '\\' , "")
        let paths = dirs.split('\\')
        
        for (let i = 0; i < paths.length; i++) {
            if (i+1 == paths.length) {
                let item = {
                    id : this.fid,
                    key : index,
                    pid : pid,
                    isdir : 0,
                    name : paths[i],
                    path : file.path,
                    size : file.length
                }
                this.files.push(item)
                this.fid++
                return
            }
            let key = this.files.findIndex(f =>f.name == paths[i])
            if (key >= 0) {
                pid = key
                continue
            }

            let info = {
                id : this.fid,
                key : 0,
                pid : pid,
                isdir : 1,
                size : 0,
                name : paths[i],
                path : ''
            }

            pid = this.fid

            this.files.push(info)
            this.fid++
        }
        return
    }

    open(pid){
        return this.files.filter( item =>item.pid == pid )
    }

    selectDir(pid){
        let files = this.files.filter(f =>f.pid == pid)
        for (let i = 0; i < files.length; i++) {
            if (files[i].isdir==1) {
                this.selectDir(files[i].id)
                continue
            }
            this.selected.push(files[i].key)
        }
        return true
    }

    select(id){
        let key = this.files.findIndex(f =>f.id == id)
        let file = this.files[key]
        if (file.isdir==1) {
            return this.selectDir(file.id)
        }
        this.selected.push(file.key)
        return true
    }

    clear(){
        this.fid = 0
        this.name = ''
        
        this.files = []
        this.selected = []

        this.dataSize = 0
        this.dataBase64 = ''
    }
}

export default Client;