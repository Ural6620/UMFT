import { lazyLoad, layoutSetter } from "@/utils/routerUtils.js";

const links = [
  {
    path: "/error",
    name: "empty",
    component: () => lazyLoad("empty"),
    meta: {
      title: "Ничего не найдено",
    },
  },
];
layoutSetter(links, "empty");
export default links;
