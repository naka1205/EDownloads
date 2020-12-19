import { app } from 'electron'
import Forever from 'forever-monitor'
import Path from 'path'

class Download {

    constructor() {
        this.command = null

        this.init() 
    }

    init(){
        
        let aria2c = Path.join(app.root,'./extend/aria2c.exe')
        let conf = Path.join(app.root,'./extend/aria2c.conf')
        let session = Path.join(app.root,'./extend/aria2c.session')

        this.command = Forever.start([`${aria2c}`, `--conf-path=${conf}` , `--save-session=${session}`], {
            max: !app.isPackaged ? 0 : 100,
            parser: function (command, args) {
                return {command: command,args: args}
            },
            env: {ELECTRON_RUN_AS_NODE: 1},
            silent: app.isPackaged
        })

        this.command.on('error', (err) => {
            console.log(`aria2c error: ${err}`)
        })
    
        this.command.on('start', (process, data) => {
            console.log('aria2c started')
            app.client.start()
        })
    
        this.command.on('stop', (process) => {
            console.log('aria2c stopped')
            app.client.stop()
        })
    }

    isRunning(pid){
        try {
            return process.kill(pid, 0)
        } catch (e) {
            return e.code === 'EPERM'
        }
    }

    stop(){
        const { pid } = this.command.child
        try {
            this.command.stop()
        } catch (err) {
            this.forceStop(pid)
        } finally {
            this.command.removeAllListeners()
        }
    }

    forceStop(pid){
        try {
            if (pid && this.isRunning(pid)) {
                process.kill(pid)
            }
        } catch (err) {
            console.log('forceStop',err)
        }
    }

    restart () {
        this.stop()
        this.init()
    }
}

export default Download;