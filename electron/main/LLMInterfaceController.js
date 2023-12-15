const path = require("path");
const koffi = require('koffi');
class LLMInterfaceController {
	static _WIN = null
	static GLOBAL_FUNC_DICT = {};
	static GLOBAL_MODEL = null;
	static GLOBAL_MODEL_ID = "MiniChat-1.5-3B-q4f16_1";
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

		let dllPath = path.resolve("./modules/LLMInterfaceProject");
		let modelPath = path.resolve("./models/");
		// 检测是否打包环境
		if(LLMInterfaceController.IS_PACKAGE_ENV){
			dllPath = path.resolve("./LLMInterfaceProject");
			modelPath = path.resolve("./models/");
		}

		console.log("dllpath: " + dllPath);

		const libLLM = koffi.load(dllPath)
		const load_global_env = libLLM.func('void init_global_env()')
		const load_model_path_async = libLLM.func('void load_model_path_async(const char* search_path, const char* model_id)');
		const check_model_valid = libLLM.func('int check_model_valid(const char* model_id)');
		const wait_to_check_model_valid = libLLM.func('int wait_to_check_model_valid(const char* model_id, int timeout)');

		const add_new_prompt = libLLM.func('void add_new_prompt(const char* model_id, const char* prompt)');
		const get_model_response = libLLM.func('const char* get_model_response(const char* model_id)');
		const wait_to_get_model_response = libLLM.func('const char* wait_to_get_model_response(const char* model_id, int timeout)');
		const finalize_global_env = libLLM.func('void finalize_global_env()');

		// 记录DLL全局函数字典
		LLMInterfaceController.GLOBAL_FUNC_DICT = {
			load_global_env: load_global_env,
			load_model_path_async: load_model_path_async,
			check_model_valid: check_model_valid,
			wait_to_check_model_valid: wait_to_check_model_valid,
			add_new_prompt: add_new_prompt,
			get_model_response: get_model_response,
			wait_to_get_model_response: wait_to_get_model_response,
			finalize_global_env: finalize_global_env
		};

		// 启动全局环境
		load_global_env()
		// 异步加载模型
		load_model_path_async(modelPath, LLMInterfaceController.GLOBAL_MODEL_ID)

		// 开始轮询检测模型是否加载完成
		LLMInterfaceController.CheckModelFinish();
	}

	static CheckModelFinish() {
		setTimeout(() => {
			console.log("check model valid")
			const result = LLMInterfaceController.GLOBAL_FUNC_DICT.check_model_valid(
				LLMInterfaceController.GLOBAL_MODEL_ID);
			// 返回1加载成功
			if(result === 1){
				LLMInterfaceController.IS_INIT = true;
				LLMInterfaceController._WIN.webContents.send("backend-init", "[INFO] LLM init success");
				console.log("LLM init success")
			}else if(result === 0){
				LLMInterfaceController._WIN.webContents.send("backend-init-fail", "[INFO] LLM init success");
				console.log("LLM init fail")
			}else{
				// see you next time
				LLMInterfaceController.CheckModelFinish();
			}
		}, 1000);
	}

	static AddNewPrompt(event, eventName, inputText) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}

		console.log("AddNewPrompt: " + inputText)
		LLMInterfaceController.GLOBAL_FUNC_DICT.add_new_prompt(
			LLMInterfaceController.GLOBAL_MODEL_ID,
			inputText)
	}

	static GetPromptResult(event, eventName) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}

		const generateResult = LLMInterfaceController.GLOBAL_FUNC_DICT.get_model_response(
			LLMInterfaceController.GLOBAL_MODEL_ID)

		if(generateResult !== null && generateResult.length > 0){
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