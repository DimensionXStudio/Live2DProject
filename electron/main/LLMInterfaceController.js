const path = require("path");
const koffi = require('koffi');
class LLMInterfaceController {
	static _WIN = null
	static GLOBAL_FUNC_DICT = {};
	static GLOBAL_MODEL = null;
	static IS_INIT = false;
	static IS_PACKAGE_ENV = true;
	static initLLMModule(app, ipc, win) {
		LLMInterfaceController.IS_PACKAGE_ENV = app.isPackaged
		LLMInterfaceController._WIN = win
		LLMInterfaceController.TryInit(null)
		// 提供给前端的接口
		ipc.on('backend-init', LLMInterfaceController.TryInit)
		ipc.on('backend-inference', LLMInterfaceController.GetInterfaceResult)
	}

	static TryInit(event) {
		if(LLMInterfaceController.IS_INIT) return;

		let dllPath = path.resolve("./modules/LLMInterfaceProject");
		let modelPath = path.resolve("./models/");
		// 检测是否打包环境
		if(LLMInterfaceController.IS_PACKAGE_ENV){
			dllPath = path.resolve("./LLMInterfaceProject");
			modelPath = path.resolve("./models/");
		}

		console.log("dllpath: " + dllPath);

		const libLLM = koffi.load(dllPath)
		const load_model_path = libLLM.func('void* load_model_path(const char* search_path, const char* model_id)');
		const get_response = libLLM.func('const char* get_response(void* chat, const char* prompt, bool role_prefix)');
		const reset_model = libLLM.func('void reset_chat_module(void* chat)')
		const release_model = libLLM.func('void release_chat_module(void* chat)')

		// 记录DLL全局函数字典
		LLMInterfaceController.GLOBAL_FUNC_DICT = {
			load_model_path: load_model_path,
			get_response: get_response,
			reset_model: reset_model,
			release_model: release_model,
		};

		// 加载模型
		let pChatModel = load_model_path(modelPath, "MiniChat-1.5-3B-q4f16_1");
		if(pChatModel == null){
			console.log("load model failed");
			LLMInterfaceController.IS_INIT = false;
		}else{
			console.log("load model success");
			LLMInterfaceController.GLOBAL_MODEL = pChatModel;
			LLMInterfaceController.IS_INIT = true;
		}
	}

	static GetInterfaceResult(event, eventName, inputText) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}

		// 返回的是一个utf-8编码的字符串
		let generateResult = LLMInterfaceController.GLOBAL_FUNC_DICT.get_response(
			LLMInterfaceController.GLOBAL_MODEL,
			inputText,
			false)

		console.log(generateResult);
		LLMInterfaceController._WIN.webContents.send(eventName, generateResult);
	}

	static ResetModel(event, eventName) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}
		LLMInterfaceController.GLOBAL_FUNC_DICT.reset_model(LLMInterfaceController.GLOBAL_MODEL);
	}
}

module.exports = LLMInterfaceController