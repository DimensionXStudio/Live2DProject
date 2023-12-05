const {join} = require("path");
class GTransform {
	static _WIN = null
	static pipeline = null;

	static async initTransform(ipc, window) {
		GTransform._WIN = window
		console.log("start initTransform")
		let { pipeline, env } = await import('@xenova/transformers');

		env.allowRemoteModels = false;
		env.allowLocalModels = true;
		env.localModelPath = join(__dirname, "../models");

		// 这b模型还得转onnx格式，放到LaMini-Flan-T5-783M/onnx/encoder_model_quantized.onnx
		GTransform.pipeline = await pipeline('text2text-generation', 'LaMini-Flan-T5-783M')
		console.log("load model LaMini-Flan-T5-783M")

		// 网页要求弹出消息框
		ipc.on('backend-inference', GTransform.GetDecodeWrapper)
	}

	static async GetDecodeWrapper(event, eventName, inputText) {
		if(GTransform.pipeline == null){
			console.log("哎哟你干嘛模型都没加载")
			return "模型未初始化"
		}
		let output = await GTransform.pipeline(inputText);
		console.log("LaMini-Flan-T5-783M output:", output);
		output = JSON.stringify(output)
		GTransform._WIN.webContents.send(eventName, output);
	}
}

module.exports = GTransform;