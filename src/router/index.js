import { createRouter, createWebHistory } from "vue-router";

import dashboardPages from "./dashboard";
import authPages from "./auth";
import emptyPages from "./empty";
import { mainMiddleware } from "./middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...dashboardPages, ...authPages, ...emptyPages],
});

router.beforeEach(mainMiddleware);

export default router;
