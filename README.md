# EDownloads
===============
## 介绍
技术栈：electron + vue + elementui + aria2

基于`electron` + `aria2` 开发的下载工具，支持下载协议:BT种子、磁力链接、FTP、HTTP，以及百度网盘。
![界面](https://file.oyoula.com/image/edownload.gif)

### 说明
* 通过`百度网盘开放平台`API获取文件信息
* 使用`VUE` + `elementui`实现可视化管理
* 通过`Aria2`进行高速下载
* 利用`electron`打包成桌面应用

### 功能
1. 百度网盘扫码登录
2. 百度网盘文件管理，文件下载
3. 百度网盘分享链接解析，一键转存
4. 支持BT和磁力链接下载
5. 支持BT文件解析，文件选择下载

### 调试
```
# 初始化
npm install

# 开发
npm run electron:serve

# 打包
npm run electron:build

```
