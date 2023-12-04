<template>
    <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        background-color="#707070"
        text-color="#fff"
        active-text-color="white"
        id="header-menu"
        :ellipsis="false">


        <el-menu-item class="header-item-no-drag" index="0" @click="navigateTo('/')">
            <img
                style="width: 100px"
                src="../../public/element-plus-logo.svg"
                alt="Element logo"
            />
        </el-menu-item>

        <div style="flex-grow: 1;"/>
        <TitleButton class="header-item-no-drag"  type="min" />
        <TitleButton class="header-item-no-drag"  type="max" />
        <TitleButton class="header-item-no-drag"  type="close" />
    </el-menu>

</template>

<script>
import TitleButton from "@/components/TitleButton.vue";

export default {
    name: "HeaderComp",
    components: {TitleButton},
    data() {
        return {
            activeIndex: '',
        }
    },
    methods: {
        navigateTo(url) {
            this.$router.push(url)
        }
    }
}
</script>

<style scoped>
#header-menu {
    width: 100%;
    -webkit-app-region: drag;
    border: none;
    position: fixed;
    z-index: 99;
}

.header-item-no-drag {
    -webkit-app-region: no-drag;
}

</style>