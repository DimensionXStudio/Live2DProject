<template>
    <div id="main-page">
        <el-card id="main-card">
            <canvas id="canvas-view"></canvas>
        </el-card>
    </div>
</template>

<script>
import {Live2DModel, MotionPreloadStrategy, InternalModel} from 'pixi-live2d-display';
import * as PIXI from 'pixi.js'
export default {
    name: "MainPage",
    data() {
        return {
            model: null,
            app: null
        }
    },

    mounted() {
        this.loadEnv()
    },

    methods: {
        loadEnv() {
            window.PIXI = PIXI;
            this.initModel();
        },

        async initModel() {
            const model = await Live2DModel.from('./model2/HK416_805/normal.model3.json',
                { motionPreload: MotionPreloadStrategy.NONE,  })
            const app = new PIXI.Application({
                // 配置模型舞台
                view: document.getElementById('canvas-view'),
                // 背景是否透明
                transparent: true,
                autoDensity:true,
                autoResize: true,
                antialias: true,
                // 高度
                height: '360',
                // 宽度
                width:'420'
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
        }
    }
}
</script>

<style scoped>
#main-page {
    width: 100%;
    height: 100%;
    display: block;
    margin: auto;
}

#main-card {
    width: 99%;
    height: 380px;
    margin: 20px auto;
    display: block;
}

</style>