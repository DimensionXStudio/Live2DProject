<template>
    <div id="main-page">
        <canvas id="canvas-view"></canvas>
        <!--flex后子元素间留个空间-->
        <div style="width: 99%; height: 35px; display: flex; flex-direction: row; justify-content: space-between ">
            <el-input v-model="inputText" placeholder="我想说..."></el-input>
            <el-button @click="sendMessage">发送</el-button>
        </div>

    </div>
</template>

<script>
import {Live2DModel, MotionPreloadStrategy, InternalModel} from 'pixi-live2d-display';
import * as PIXI from 'pixi.js'
import ServiceApi from "@/services/ServiceApi";
import {ElMessage} from "element-plus";

export default {
    name: "MainPage",
    data() {
        return {
            // live2d模型
            model: null,
            app: null,

            // 输入框文字
            inputText: '',

            responseEventName: "inferenceResponseEvent",
            // 错误事件名
            errorEventName: "inferenceErrorEvent"
        }
    },

    mounted() {
        this.loadEnv()
        ServiceApi.RegistResponseEvent(this.responseEventName, this.handleInferenceResponseEvent)
        ServiceApi.RegistResponseEvent(this.errorEventName, this.handleOnError)
    },

    unmounted() {
        ServiceApi.UnregistResponseEvent(this.responseEventName, this.handleInferenceResponseEvent)
        ServiceApi.UnregistResponseEvent(this.errorEventName, this.handleOnError)
    },

    methods: {
        handleInferenceResponseEvent(event, args) {
            console.log(args)
            ElMessage.success(args)
        },

        handleOnError(event, args) {
            console.log(args)
            ElMessage.error(args)
        },

        loadEnv() {
            window.PIXI = PIXI;
            //this.initL2DModel();
        },

        async initL2DModel() {
            const model = await Live2DModel.from('./model2/HK416_805/normal.model3.json',
                {motionPreload: MotionPreloadStrategy.NONE,})
            const app = new PIXI.Application({
                // 配置模型舞台
                view: document.getElementById('canvas-view'),
                // 背景是否透明
                backgroundAlpha: 0,
                autoDensity: true,
                autoResize: true,
                antialias: true,
                // 高度
                height: '360',
                // 宽度
                width: '420'
            })

            //model.trackedPointers = [{ id: 1, type: 'pointerdown', flags: true }, { id: 2, type: 'mousemove', flags: true }]
            // 添加模型到舞台
            app.stage.addChild(model)
            // 模型的缩放
            model.scale.set(0.07)
            // 模型的位置,x,y相较于窗口左上角
            model.x = 0
            // 添加模型状态管理器
            model.InternalModel = new InternalModel(model)

            this.app = app
            this.model = model
        },

        sendMessage() {
            if (this.inputText === '') {
                return
            }

            // 发送消息
            ServiceApi.AddNewPrompt(this.errorEventName, this.inputText)
            // 开始轮询getPromptResult
            ServiceApi.GetPromptResult(this.responseEventName)
        }
    }
}
</script>

<style scoped>
#main-page {
    width: 99%;
    height: 380px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    /*透明背景 */
    background: rgba(0, 0, 0, 0);
}
</style>