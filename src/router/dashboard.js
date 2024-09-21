import { lazyLoad, layoutSetter } from "@/utils/routerUtils.js";

const links = [
  {
    path: "/",
    name: "home",
    component: () => lazyLoad("dashboard/home"),
    meta: {
      title: "Бош саҳифа",
    },
  },
  {
    path: "/rooms",
    name: "rooms",
    component: () => lazyLoad("dashboard/rooms"),
    meta: { title: "Хоналар" },
    props: route => ({
      pageNum: route.query.page || 1,
      titleRoom: route.query.room || '',
      filialId: route.query.filial || '',
      filialTitle: route.query.filialTitle || 'Barcha filiallar'
    }),
  },
  {
    path: "/filial",
    name: "filial",
    component: () => lazyLoad("dashboard/filial"),
    meta: {
      title: "Филиаллар",
    },
    props: route => ({
      pageNum: route.query.page || 1,
      titleFilial: route.query.filial || ''
    }),
  },
  {
    path: "/category",
    name: "category",
    component: () => lazyLoad("dashboard/category"),
    meta: {
      title: "Тоифалар",
    },
    props: route => ({
      pageNum: route.query.page || 1,
      titleCategory: route.query.title || ''
    })
  },
  {
    path: "/product",
    name: "product",
    component: () => lazyLoad("dashboard/product"),
    meta: {
      title: "Маҳсулотлар",
    },
    props: route => ({
      pageNum: route.query.page || 1,
      titleProduct: route.query.product || ''
    }),
  },
  {
    path: "/invoice",
    name: "invoice",
    component: () => lazyLoad("dashboard/invoice"),
    meta: {
      title: "Счёт Фактура",
    },
    props: route => ({
      pageNum: route.query.page || 1,
      titleProduct: route.query.invoice || ''
    }),
  },
  {
    path: "/employee",
    name: "employee",
    component: () => lazyLoad("dashboard/employee"),
    meta: {
      title: "Ходимлар",
    },
    props: route => ({
      pageNum: route.query.page || 1,
      titleProduct: route.query.employee || ''
    }),
  },
  {
    path: "/code",
    name: "qrCode",
    component: () => lazyLoad("dashboard/qrCode"),
    meta: {
      title: "Қр Кодлар",
    },
    props: route => ({
      pageNum: route.query.page || 1,
      titleProduct: route.query.code || ''
    })
  },
];
layoutSetter(links, "dashboard");
export default links;
