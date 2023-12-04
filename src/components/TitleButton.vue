<template>
    <div
        class="title-btn"
        :style="style"
        @click="click"/>
</template>

<script>
const {ipcRenderer} = require('electron')
const style = {
    min: {
        backgroundColor: 'white',
        right:'65px'
    },
    max: {
        backgroundColor: 'yellow',
        right:'40px'
    },
    close: {
        backgroundColor: 'red',
        right:'15px'
    }
};
export default {
    name: 'TitleButton',
    props: ['type'],
    computed: {
        style: function () {
            return style[this.type];
        }
    },
    methods: {
        click: function () {
            ipcRenderer.send(this.type);
        }
    }
}
</script>

<style scoped>
.title-btn {
    position: absolute;
    top: 10px;
    width: 15px;
    height: 15px;
    -webkit-app-region: no-drag;
    border-radius: 50%;
    cursor: pointer;
}

.titlebtn:hover{
    border: 1px solid rgba(248, 242, 242, 0.6);
}
</style>