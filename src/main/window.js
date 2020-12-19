import { BrowserWindow, Tray, Menu, app } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

class Window {

    constructor() {
        this.win = null
        this.tray = null
    }

	createWindow() {

        const logo = `${__static}/logo.ico`

		this.win = new BrowserWindow({
            width: 1080,
			height: 560,
			maxWidth: 1080,
            minWidth: 560,
            frame: true,
            icon: logo,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
				devTools:true,
				webviewTag : true
            }
            
        })
        
        this.win.removeMenu()
        // console.log(process.env.WEBPACK_DEV_SERVER_URL)
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            this.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
            this.win.webContents.openDevTools()
            // if (!process.env.IS_TEST) this.win.webContents.openDevTools()
        } else {
            createProtocol('app')
            this.win.loadURL('app://./index.html')
        }
      
        this.win.on("closed", () => {
            this.win = null;
        });

	}

	checkMainWindow() {
		if (!this.win) this.createWindow()
	}

	getMainWindow() {
		this.checkMainWindow()
		return this.win
	}

}

export default Window;