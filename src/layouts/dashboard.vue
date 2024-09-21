<script setup>
import Header from "@/components/layout/dashboard/Header.vue";
import Sidebar from "@/components/layout/dashboard/Sidebar.vue";

</script>
<template>
  <div class="flex flex-col-reverse lg:flex-row h-screen w-screen">
    <Sidebar class="sticky lg:h-screen bottom-0 h-20 w-screen  lg:top-0 left-0 z-50 lg:w-[18%] bg-white" />

    <div class="flex h-full w-full flex-col relative left-0">
      <Header />
      <div class="h-full bg-[#F5F7FA] p-4">
        <slot />
      </div>
    </div>

  </div>
</template>
