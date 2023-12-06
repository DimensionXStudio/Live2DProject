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

最后，从https://huggingface.co/Xenova/LaMini-Flan-T5-783M/tree/main/onnx
下载onnx模型，放到electron/models/LaMini-Flan-T5-783M/onnx下，完成模型放置

理论上能兼容Transform.js的LLM模型（ONNX格式）都能直接使用


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