import { lazyLoad, layoutSetter } from "@/utils/routerUtils.js";

const links = [
  {
    path: "/show/:id",
    name: "show",
    component: () => lazyLoad("show"),
    meta: {
      title: "Show Page",
      layout: "show",
    },
  },
];

layoutSetter(links, "show");
export default links;
