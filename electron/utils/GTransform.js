import {pipeline} from '@xenova/transformers';

class GTransform {
	static LLM_INSTANCE = null;
	static async CreateLLMPipeLine() {
		if(GTransform.LLM_INSTANCE === null) {
			GTransform.LLM_INSTANCE = await pipeline('sentiment-analysis');
		}
		return GTransform.LLM_INSTANCE;
	}
}

module.exports = GTransform;