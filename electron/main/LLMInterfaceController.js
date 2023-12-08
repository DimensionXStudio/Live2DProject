const path = require("path");
const koffi = require('koffi');
class LLMInterfaceController {
	static GLOBAL_LIB = null;
	static initLLMModule(app, ipc, win) {
		let dllPath = path.resolve("./modules/libLLMInterfaceProject");
		let modelPath = path.resolve("./models/gpt-2-117M/ggml-model.bin");
		// 检测是否打包环境
		if(app.isPackaged){
			dllPath = path.resolve("./libLLMInterfaceProject");
			modelPath = path.resolve("./models/gpt-2-117M/ggml-model.bin");
		}

		console.log("dllpath: " + dllPath)

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

		// 初始化全局环境
		init_global_env()

		var params = get_default_params(modelPath)
		var model = get_default_model()
		var vocab = get_default_vocab()

		// 加载模型
		if(init_gpt2_model(model, vocab, params)) {
			console.log("load model GPT2 success")
			// 加载后端
			var sched = get_default_sched()
			create_backend_sched(model, sched, params)
			var result = text2text_generate(model, vocab, sched, params, "hello from electron!")
			console.log(result)

			// 释放资源
			free_resource(model, sched)
		}else{
			console.log("load model GPT2 failed")
		}
	}
}

module.exports = LLMInterfaceController