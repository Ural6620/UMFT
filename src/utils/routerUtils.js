const lazyLoad = async (path) => {
  const comps = import.meta.glob("../pages/**/*.vue");
  const match = comps[`../pages/${path}/index.vue`];
  return (await match()).default;
};

function layoutSetter(array, layoutName = "dashboard") {
  if (!Array.isArray(array) || (Array.isArray(array) && !array.length)) return;

  if (
    array.children &&
    Array.isArray(array.children) &&
    array.children.length
  ) {
    array.children = layoutSetter(array.children, layoutName);
  }

  array.forEach((elem) => {
    if (!elem.meta) elem.meta = {};
    elem.meta.layout = layoutName;
  });
}

export { lazyLoad, layoutSetter };
