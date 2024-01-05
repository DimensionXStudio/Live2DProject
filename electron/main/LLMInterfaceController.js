const path = require("path");
const koffi = require('koffi');
class LLMInterfaceController {
	static _WIN = null
	static GLOBAL_FUNC_DICT = {};
	static IS_INIT = false;
	static IS_PACKAGE_ENV = true;
	static initLLMModule(app, ipc, win) {
		LLMInterfaceController.IS_PACKAGE_ENV = app.isPackaged
		LLMInterfaceController._WIN = win
		LLMInterfaceController.TryInit(null)
		// 提供给前端的接口
		ipc.on('backend-init', LLMInterfaceController.TryInit)
		ipc.on('backend-add-new-prompt', LLMInterfaceController.AddNewPrompt)
		ipc.on('backend-get-prompt-result', LLMInterfaceController.GetPromptResult)
	}

	static TryInit(event) {
		if(LLMInterfaceController.IS_INIT) return;

		let dllPath = path.resolve("./modules/libLLMInterfaceProject");
		let modelPath = path.resolve("./models/minichat-1.5-3b-q4f16.gguf");
		// 检测是否打包环境
		if(LLMInterfaceController.IS_PACKAGE_ENV){
			dllPath = path.resolve("./libLLMInterfaceProject");
			modelPath = path.resolve("./models/minichat-1.5-3b-q4f16.gguf");
		}

		console.log("dllpath: " + dllPath);

		const libLLM = koffi.load(dllPath)
		const init_model_data = libLLM.func('void init_model_data(const char* model_path)')
		const init_backend_env = libLLM.func('bool init_backend_env()');
		const reset_chat_env = libLLM.func('bool reset_chat_env()');

		const add_new_prompt = libLLM.func('void add_new_prompt(const char* input, bool need_user_format)');
		const get_response = libLLM.func('const char* get_response()');
		const wait_to_get_response = libLLM.func('const char* wait_to_get_response()');

		// 记录DLL全局函数字典
		LLMInterfaceController.GLOBAL_FUNC_DICT = {
			init_model_data: init_model_data,
			init_backend_env: init_backend_env,
			reset_chat_env: reset_chat_env,

			add_new_prompt: add_new_prompt,
			get_response: get_response,
			wait_to_get_response: wait_to_get_response,
		};

		// 加载模型数据
		init_model_data(modelPath);
		// 加载llamacpp后端
		if(!init_backend_env()){
			console.log("init_backend_env fail")
			LLMInterfaceController._WIN.webContents.send("backend-init-fail", "[ERROR] init_backend_env fail");
			return;
		}
		// 重置聊天环境
		if(!reset_chat_env()) {
			console.log("reset_chat_env fail")
			LLMInterfaceController._WIN.webContents.send("backend-init-fail", "[ERROR] reset_chat_env fail");
			return;
		}

		// 初始化成功
		LLMInterfaceController.IS_INIT = true;
		LLMInterfaceController._WIN.webContents.send("backend-init", "[INFO] LLM init success");
	}

	static AddNewPrompt(event, eventName, inputText) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}

		console.log("AddNewPrompt: " + inputText)
		LLMInterfaceController.GLOBAL_FUNC_DICT.add_new_prompt(inputText, true)
	}

	static GetPromptResult(event, eventName) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}

		const generateResult = LLMInterfaceController.GLOBAL_FUNC_DICT.get_response()

		if(generateResult !== null && generateResult.length > 0){
			console.log("GetPromptResult: " + generateResult)
			LLMInterfaceController._WIN.webContents.send(eventName, generateResult);
		}else{
			// 等1秒后再次轮询
			setTimeout(() => {
				LLMInterfaceController.GetPromptResult(event, eventName);
			}, 1000);
		}
	}
}

module.exports = LLMInterfaceController