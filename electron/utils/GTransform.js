import {AutoModelForSeq2SeqLM, AutoTokenizer} from '@xenova/transformers';
import {dialog} from "electron";

class GTransform {
	static _WIN = null
	static tokenizer = await AutoTokenizer.from_pretrained('Xenova/t5-small');
	static model = await AutoModelForSeq2SeqLM.from_pretrained('Xenova/t5-small');

	static init(ipc, window) {
		GTransform._WIN = window
		// 网页要求弹出消息框
		ipc.on('backend-inference', function (event, callBackEventName, inputText) {
			const result = GTransform.GetDecodeResult(inputText);
			// 返回给前端
			GTransform._WIN.webContents.send(callBackEventName, result)
		})
	}

	static async GetDecodeResult(inputText) {
		let { input_ids } = await GTransform.tokenizer(inputText);
		let outputs = await GTransform.model.generate(input_ids);

		return GTransform.tokenizer.decode(outputs[0], {skip_special_tokens: true});
	}
}

module.exports = GTransform;