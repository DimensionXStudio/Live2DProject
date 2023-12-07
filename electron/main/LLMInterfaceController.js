const path = require("path");
const ffi = require('ffi-napi');
const ref = require('ref-napi');
class LLMInterfaceController {
	static GLOBAL_LIB = null;
	static initLLMModule(ipc, win) {
		const dllPath = path.resolve("modules/libLLMInterfaceProject");

		// 我们压根不需要知道c++的类型，只需要知道是tmd的指针
		var voidType = ref.types.void
		var voidPtr = ref.refType(voidType)

		LLMInterfaceController.GLOBAL_LIB = ffi.Library(dllPath, {
			'init_global_env': ['void', []],
			'get_default_model': [voidPtr, []],
			'get_default_vocab': [voidPtr, []],
			'get_default_params': [voidPtr, []],
			'get_default_sched': [voidPtr, []],
			'init_gpt2_model': ['bool', [voidPtr, voidPtr, voidPtr]],
			'create_backend_sched': ['void', [voidPtr, voidPtr, voidPtr]],
			'text2text_generate': ['string', [voidPtr, voidPtr, voidPtr, voidPtr, "string"]],
			'free_resource': ['void', [voidPtr, voidPtr]]
		})

		LLMInterfaceController.GLOBAL_LIB.init_global_env()

		var model = LLMInterfaceController.GLOBAL_LIB.get_default_model()
		var vocab = LLMInterfaceController.GLOBAL_LIB.get_default_vocab()
		var params = LLMInterfaceController.GLOBAL_LIB.get_default_params()

		// 加载模型
		if(LLMInterfaceController.GLOBAL_LIB.init_gpt2_model(model, vocab, params)) {
			console.log("load model GPT2 117M success")
		}else{
			console.log("load model GPT2 117M failed")
		}

		// 加载后端
		var sched = LLMInterfaceController.GLOBAL_LIB.get_default_sched()
		LLMInterfaceController.GLOBAL_LIB.create_backend_sched(model, sched, params)
		var result = LLMInterfaceController.GLOBAL_LIB.text2text_generate(model, vocab, sched, params, "hello from electron!")
		console.log(result)

		// 释放资源
		LLMInterfaceController.GLOBAL_LIB.free_resource(model, sched)
	}
}

module.exports = LLMInterfaceController