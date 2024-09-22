<script setup>
import Header from "@/components/layout/dashboard/Header.vue";
import Sidebar from "@/components/layout/dashboard/Sidebar.vue";
</script>
<template>
  <div class="flex h-screen w-screen flex-col-reverse overflow-hidden lg:flex-row">
    <Sidebar class="sticky bottom-0 left-0 z-50 h-20 w-screen bg-white lg:top-0 lg:h-screen lg:w-[18%]" />

    <div class="relative left-0 flex h-screen flex-1 flex-col">
      <Header />
      <div class="flex flex-1 flex-col overflow-hidden bg-[#F5F7FA] p-4">
        <slot />
      </div>
    </div>
  </div>
</template>
