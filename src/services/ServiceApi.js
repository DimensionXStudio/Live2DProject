const {ipcRenderer} = require('electron')
export default {
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
