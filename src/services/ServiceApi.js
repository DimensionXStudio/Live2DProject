const {ipcRenderer} = require('electron')
export default {
    AddNewPrompt(errEventName, inputText){
        ipcRenderer.send('backend-add-new-prompt', errEventName, inputText)
    },

    GetPromptResult(responseEventName){
        ipcRenderer.send('backend-get-prompt-result', responseEventName)
    },

    StartInference(responseEventName, inputText){
        ipcRenderer.send('backend-inference', responseEventName, inputText)
    },

    ShowSystemDialog(type, title, message, detail){
        ipcRenderer.send('electron-messagebox', type, title, message, detail)
    },

    RegistResponseEvent(responseEventName, callback){
        ipcRenderer.on(responseEventName, callback)
    },

    UnregistResponseEvent(responseEventName, callback){
        ipcRenderer.removeListener(responseEventName, callback)
    },
}
