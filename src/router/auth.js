import { lazyLoad, layoutSetter } from "@/utils/routerUtils.js";

const links = [
  {
    path: "/login",
    name: "login",
    component: () => lazyLoad("auth"),
    meta: {
      title: "Login",
    },
  },
];
layoutSetter(links, "auth");
export default links;
