export async function loadLayoutMiddleware(to, from) {
  try {
    let layout = to.meta.layout;
    let layoutComponent = await import(`../../layouts/${layout}.vue`);
    to.meta.layoutComponent = layoutComponent.default;
  } catch (e) {
    let layout = "dashboard";
    let layoutComponent = await import(`../../layouts/${layout}.vue`);
    to.meta.layoutComponent = layoutComponent.default;
  }
}
