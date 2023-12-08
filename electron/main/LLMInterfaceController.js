const path = require("path");
const koffi = require('koffi');
class LLMInterfaceController {
	static _WIN = null
	static GLOBAL_FUNC_DICT = {};
	static GLOBAL_PARAMS = null;
	static GLOBAL_MODEL = null;
	static GLOBAL_VOCAB = null;
	static GLOBAL_SCHED = null;
	static IS_INIT = false;
	static IS_PACKAGE_ENV = true;
	static initLLMModule(app, ipc, win) {
		LLMInterfaceController.IS_PACKAGE_ENV = app.isPackaged
		LLMInterfaceController._WIN = win
		LLMInterfaceController.TryInit(null)
		// 提供给前端的接口
		ipc.on('backend-init', LLMInterfaceController.TryInit)
		ipc.on('backend-inference', LLMInterfaceController.GetInterfaceResult)
		ipc.on('backend-release', LLMInterfaceController.TryRelease)
	}

	static TryInit(event) {
		if(LLMInterfaceController.IS_INIT) return;

		let dllPath = path.resolve("./modules/libLLMInterfaceProject");
		let modelPath = path.resolve("./models/gpt-2-117M/ggml-model.bin");
		// 检测是否打包环境
		if(LLMInterfaceController.IS_PACKAGE_ENV){
			dllPath = path.resolve("./libLLMInterfaceProject");
			modelPath = path.resolve("./models/gpt-2-117M/ggml-model.bin");
		}

		console.log("dllpath: " + dllPath);

		const libLLM = koffi.load(dllPath)
		const init_global_env = libLLM.func('void init_global_env()');
		const get_default_model = libLLM.func('void* get_default_model()');
		const get_default_vocab = libLLM.func('void* get_default_vocab()');
		const get_default_params = libLLM.func('void* get_default_params(const char* model_path)');
		const get_default_sched = libLLM.func('void* get_default_sched()');
		const init_gpt2_model = libLLM.func('bool init_gpt2_model(void* model, void* vocab, void* params)');
		const create_backend_sched = libLLM.func('void create_backend_sched(void* model, void* sched, void* params)');
		const text2text_generate = libLLM.func('char* text2text_generate(void* model, void* vocab, void* sched, void* params, const char*)');
		const free_resource = libLLM.func('void free_resource(void* model, void* sched)');

		// 记录DLL全局函数字典
		LLMInterfaceController.GLOBAL_FUNC_DICT = {
			init_global_env: init_global_env,
			get_default_model: get_default_model,
			get_default_vocab: get_default_vocab,
			get_default_params: get_default_params,
			get_default_sched: get_default_sched,
			init_gpt2_model: init_gpt2_model,
			create_backend_sched: create_backend_sched,
			text2text_generate: text2text_generate,
			free_resource: free_resource,
		};

		// 初始化全局环境
		init_global_env();

		LLMInterfaceController.GLOBAL_PARAMS = get_default_params(modelPath);
		LLMInterfaceController.GLOBAL_MODEL = get_default_model();
		LLMInterfaceController.GLOBAL_VOCAB = get_default_vocab();

		// 加载模型
		if(init_gpt2_model(LLMInterfaceController.GLOBAL_MODEL, LLMInterfaceController.GLOBAL_VOCAB, LLMInterfaceController.GLOBAL_PARAMS)) {
			console.log("load model GPT2 success");
			// 加载后端
			LLMInterfaceController.GLOBAL_SCHED = get_default_sched();
			create_backend_sched(LLMInterfaceController.GLOBAL_MODEL, LLMInterfaceController.GLOBAL_SCHED, LLMInterfaceController.GLOBAL_PARAMS);
			var result = text2text_generate(
				LLMInterfaceController.GLOBAL_MODEL,
				LLMInterfaceController.GLOBAL_VOCAB,
				LLMInterfaceController.GLOBAL_SCHED,
				LLMInterfaceController.GLOBAL_PARAMS,
				"hello from electron!");
			console.log(result);

			LLMInterfaceController.IS_INIT = true;
		}else{
			console.log("load model GPT2 failed");
			LLMInterfaceController.IS_INIT = false;
		}
	}

	static GetInterfaceResult(event, eventName, inputText) {
		if(!LLMInterfaceController.IS_INIT){
			LLMInterfaceController._WIN.webContents.send(eventName, "[ERROR] LLM is not init");
		}

		let generateResult = LLMInterfaceController.GLOBAL_FUNC_DICT.text2text_generate(
			LLMInterfaceController.GLOBAL_MODEL,
			LLMInterfaceController.GLOBAL_VOCAB,
			LLMInterfaceController.GLOBAL_SCHED,
			LLMInterfaceController.GLOBAL_PARAMS,
			inputText)
		console.log(generateResult)
		LLMInterfaceController._WIN.webContents.send(eventName, generateResult);
	}

	static TryRelease(event) {
		if(LLMInterfaceController.IS_INIT){
			LLMInterfaceController.GLOBAL_FUNC_DICT.free_resource(
				LLMInterfaceController.GLOBAL_MODEL,
				LLMInterfaceController.GLOBAL_SCHED)

			LLMInterfaceController.IS_INIT = false
		}
	}
}

module.exports = LLMInterfaceController