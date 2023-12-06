const {join} = require("path");
class TransformsJSWrapper {
	static _WIN = null
	static pipeline = null;

	static async initTransform(ipc, window) {
		TransformsJSWrapper._WIN = window
		console.log("start initTransform")
		let { pipeline, env } = await import('@xenova/transformers');

		env.allowRemoteModels = false;
		env.allowLocalModels = true;
		env.localModelPath = join(__dirname, "../models");

		// 这b模型还得转onnx格式，放到LaMini-Flan-T5-783M/onnx/encoder_model_quantized.onnx
		// 后续还得找conversational的模型
		TransformsJSWrapper.pipeline = await pipeline('text2text-generation', 'LaMini-Flan-T5-783M')
		console.log("load model LaMini-Flan-T5-783M")

		// 网页要求弹出消息框
		ipc.on('backend-inference', TransformsJSWrapper.GetInterfaceResult)
	}

	static async GetInterfaceResult(event, eventName, inputText) {
		if(TransformsJSWrapper.pipeline == null){
			console.log("哎哟你干嘛模型都没加载")
			return "模型未初始化"
		}
		let output = await TransformsJSWrapper.pipeline(inputText);
		console.log("LaMini-Flan-T5-783M output:", output);
		output = JSON.stringify(output)
		TransformsJSWrapper._WIN.webContents.send(eventName, output);
	}
}

module.exports = TransformsJSWrapper;