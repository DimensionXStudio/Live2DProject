import {createRouter, createWebHashHistory} from "vue-router";
import routes from "@/router/routers";

const router = createRouter({
    routes: routes,
    history: createWebHashHistory(),
})
export default router