import { useAuthStore } from "@/stores/auth";
export async function mainGuard(to, from) {
  const authStore = useAuthStore();
  const token = authStore.$state.token;
  if (!token && to.name !== "login") {
    return { name: "login" };
  }
  return true;
}
