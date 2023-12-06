const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const {join} = require("path");
const {initElectronTitleButtonFunction} = require("./ClientController");
const {initTransform} = require("../utils/TransformsJSWrapper")


// 禁止显示默认菜单
Menu.setApplicationMenu(null);

const ipc = ipcMain;

process.env.DIST = join(__dirname, "../../");

const indexHtml = join(process.env.DIST, 'dist/index.html')
const createWindow = () => {
	const win = new BrowserWindow({
		width: 420,
		height: 500,
		frame: false,
		transparent: true,
		backgroundColor: '#00000000',
		useContentSize: true,
		// 要导出electron给vue用，必须设置nodeIntegration为true
		// 同时开启webgl和webgpu
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	});
	// 窗口置顶，打包后才能生效
	win.setAlwaysOnTop(true, 'screen');

	// 是否开发环境
	if (!app.isPackaged) {
		let content = win.webContents;
		content.openDevTools();
		win.loadURL("http://localhost:5173/");
	}else{
		win.loadFile(indexHtml);
	}

	win.on("resize", () => {
		// 通知vue窗口大小变化
		win.webContents.send("vue-client-resize");
	});

	initElectronTitleButtonFunction(ipc, win);
	initTransform(ipc, win);
}

app.whenReady().then(()=>{
	createWindow()
	app.on("activate", ()=>{
		if(BrowserWindow.getAllWindows().length === 0){
			createWindow();
		}
	});

	app.on("window-all-closed", ()=>{
		app.quit();
	});
});