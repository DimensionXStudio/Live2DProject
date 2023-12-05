const {join} = require("path");
class GTransform {
	static _WIN = null
	static model = null;

	static async initTransform(ipc, window) {
		console.log("try initTransform")
		let { pipeline, env } = await import('@xenova/transformers');

		env.allowRemoteModels = false;
		env.allowLocalModels = true;
		env.localModelPath = join(__dirname, "../models");
		// env.backends.onnx.wasm.wasmPaths = join(__dirname, "../models/wasm/");

		GTransform._WIN = window
		// pytorch模型没传上来，https://huggingface.co/MBZUAI/LaMini-Flan-T5-783M/tree/main
		// 这b模型还得转onnx格式，放到LaMini-Flan-T5-783M/onnx/encoder_model_quantized.onnx
		GTransform.model = pipeline('text2text-generation', 'LaMini-Flan-T5-783M')
		// 网页要求弹出消息框
		ipc.on('backend-inference', function (event, callBackEventName, inputText) {
			const result = GTransform.GetDecodeResult(inputText);
			// 返回给前端
			GTransform._WIN.webContents.send(callBackEventName, result)
		})
	}

	static async GetDecodeResult(inputText) {
		if(GTransform.model == null){
			return "模型未初始化"
		}
		let generated_text = await GTransform.model(inputText, 512, true)
		console.log(generated_text)
		return generated_text
	}
}

module.exports = GTransform;