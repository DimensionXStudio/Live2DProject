# Live2D桌宠计划

基于ElectronJS+Vue3+Live2d实现的桌宠

## 开发环境初始化
先安装nodejs，并配置环境变量。

推荐使用安装cnpm

```bash 
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

切换到项目目录下，执行以下命令

```bash
npm install
```

若使用cnpm，则把所有npm命令替换成cnpm即可，还是装不上卡住的就直接tm走yarn install

安装最新版本的Python并设置环境变量

```bash
--linux平台
export npm_config_python=/path/to/executable/python

-- windows平台
set npm_config_python=C:\path\to\python.exe
```

使用cnpm install后，可能npm run dist-all打包会爆炸，其实就是包没装全，
再使用npm install一次就好了


## 开发中常用命令
开启预览模式
```bash
npm run start-website
npm run start-client
```

打包成可执行文件（EXE、AppImage、dmg等）
```bash
npm run dist-all
```