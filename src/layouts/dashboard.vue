<script setup>
import Sidebar from "@/components/layout/dashboard/Sidebar.vue";
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";
const authStore = useAuthStore();
onMounted(async () => {
  if (!authStore.token) {
    authStore.logout();
  }
})
</script>
<template>
  <div class="flex h-screen w-screen flex-col-reverse overflow-hidden lg:flex-row">
    <Sidebar class="sticky bottom-0 left-0 z-10 h-20 w-screen bg-white lg:top-0 lg:h-screen lg:w-fit" />
    <div class="relative left-0 flex flex-1 h-screen flex-col overflow-auto bg-[#F5F7FA] p-4">
      <slot />
    </div>
  </div>
</template>
