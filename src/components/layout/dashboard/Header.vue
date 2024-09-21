<script setup>
import { useRouter, useRoute } from "vue-router";
import { ArrowLeftStartOnRectangleIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
<template>
  <div class="sticky bg-white z-10 top-0 h-20 flex items-center px-4 py-2 justify-between">
    <h3 class="text-[#718EBF] capitalize">{{ route.meta.title }}</h3>
    <div class="flex gap-10">
      <div class="hidden md:flex items-center gap-3 bg-[#F5F7FA] rounded-full px-4 py-1 w-96 ">
        <MagnifyingGlassIcon class="w-4 h-4 text-[#718EBF] cursor-pointer" />
        <input type="text" class="bg-transparent border-none outline-none text-[#1814F3] placeholder:text-[#8BA3CB] "
          placeholder="Қидириш...">
      </div>
      <button @click="logout"
        class=" p-2 transition ease-linear bg-red-100 hover:bg-red-300 rounded justify-center items-center gap-1 inline-flex">
        <div class="w-4 h-4 relative">
          <ArrowLeftStartOnRectangleIcon class="text-red-600 trnsform rotate-180" />
        </div>
      </button>
    </div>
  </div>
</template>
