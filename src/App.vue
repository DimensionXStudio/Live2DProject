<template>
    <div id="page">
        <header-comp v-if="headerNeedRefresh"></header-comp>
        <el-container>
            <el-main id="router-page">
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>

</template>

<script>
import HeaderComp from '@/components/HeaderComp.vue';

export default {
    name: 'App',
    components: {HeaderComp},
    // 给子组件provide
    provide() {
        return {
            reload: this.reload
        }
    },
    data() {
        return {

            // 是否需要刷新header
            headerNeedRefresh: true
        }
    },

    methods: {
        reload(){
            this.headerNeedRefresh = false
            // 通过nexttick产生新任务，等dom事件循环后再创建组件
            this.$nextTick(()=>{
                this.headerNeedRefresh = true
            })
        },
    }
}
</script>

<style>
html, body{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #2b2d30;
    overflow: hidden;
}


</style>

<style scoped>
#page{
    width: 100%;
    height: 100%;
    background-color: #2b2d30;
    /* 左右底部边框 */
}

#router-page {
    width: 100%;
    height: 100%;
    /* 预留给上面的header的 */
    margin-top: 40px;
}
</style>