export function setTitle(to, from) {
  let title = to.meta.title ?? "Dashboard";
  document.title = title;
}
