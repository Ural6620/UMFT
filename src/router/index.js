import { createRouter, createWebHistory } from "vue-router";

import dashboardPages from "./dashboard";
import showPages from "./show";
import authPages from "./auth";
import emptyPages from "./empty";
import { mainMiddleware } from "./middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...dashboardPages, ...authPages, ...emptyPages, ...showPages],
});

// Middleware bilan har bir yo'nalishga o'tishda tekshirish
router.beforeEach(mainMiddleware);

export default router;
