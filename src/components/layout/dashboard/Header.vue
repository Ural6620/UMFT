<script setup>
import { useRouter, useRoute } from "vue-router";
import {
  ArrowLeftStartOnRectangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/solid";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push({ name: "login" });
}
</script>
<template>
  <div
    class="sticky top-0 z-10 flex h-20 items-center justify-between bg-white px-4 py-2"
  >
    <h3 class="capitalize text-[#718EBF]">{{ route.meta.title }}</h3>
    <div class="flex gap-10">
      <div
        class="hidden w-96 items-center gap-3 rounded-full bg-[#F5F7FA] px-4 py-1 md:flex"
      >
        <MagnifyingGlassIcon class="h-4 w-4 cursor-pointer text-[#718EBF]" />
        <input
          type="text"
          class="text-main border-none bg-transparent outline-none placeholder:text-[#8BA3CB]"
          placeholder="Қидириш..."
        />
      </div>
      <button
        @click="logout"
        class="inline-flex items-center justify-center gap-1 rounded bg-red-100 p-2 transition ease-linear hover:bg-red-300"
      >
        <div class="relative h-4 w-4">
          <ArrowLeftStartOnRectangleIcon
            class="trnsform rotate-180 text-red-600"
          />
        </div>
      </button>
    </div>
  </div>
</template>
