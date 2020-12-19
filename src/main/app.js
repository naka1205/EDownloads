'use strict'

import { app, shell, protocol, BrowserWindow } from 'electron'
import Store from 'electron-store'
import Window from './window'
import Download from './download'
import Client from './client'
import Baidu from './baidu'
import Path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

app.root = Path.join(app.getAppPath(), app.isPackaged ? '../' : '../../')

app.main = new Window()
app.store = new Store()
app.download = new Download()
app.client = new Client()

app.reboot = () => {
  app.relaunch()
  app.exit(0)
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

app.allowRendererProcessReuse = false

app.on("web-contents-created", (_, webContents) => {
  webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.download.stop()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) app.main.checkMainWindow()
})

app.on('ready', () => {

  const defaultSetup = {
    lang: app.getLocale(),
    folder: app.getPath('downloads')
  }

  const defaultToken = {
    access:'',
    refresh:''
  }
  
  app.defaults = defaultSetup
  app.setup = app.store.has('setup') ? app.store.get('setup') : defaultSetup
  app.token = app.store.has('token') ? app.store.get('token') : defaultToken

  app.baidu = new Baidu()

  app.main.checkMainWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}