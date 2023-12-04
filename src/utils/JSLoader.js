export class JSLoader {
	static $(Nid){
		return document.getElementsByName(Nid);
	}
	static asyncLoadJs(url) {
		return new Promise((resolve, reject) => {
			let hasLoaded = JSLoader.$('script[src="' + url + '"]').length > 0
			if (hasLoaded) {
				console.log("检测到" + url + "已加载")
				resolve()
				return
			}

			let script = document.createElement('script')
			script.type = 'text/javascript'
			script.src = url
			document.body.appendChild(script)
			script.onload = () => {
				resolve()
			}
			script.onerror = () => {
				reject()
			}
		})
	}

	static loadLive2DJS() {
		return new Promise((resolve, reject) => {
			const promise2 = JSLoader.asyncLoadJs('src/library/live2d/live2d.min.js')
			const promise1 = JSLoader.asyncLoadJs('src/library/live2d/live2dcubismcore.min.js')
			promise1.then(() => {
				promise2.then(() => {
					resolve()
				}).catch(err => {
					reject(err)
				})
			}).catch(err => {
				reject(err)
			})
		})
	}
}