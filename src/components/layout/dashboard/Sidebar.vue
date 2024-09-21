<script setup>
import { useRoute } from "vue-router";
import { HomeIcon, BuildingOffice2Icon, BuildingOfficeIcon, ChartBarIcon, ClipboardDocumentListIcon, WalletIcon, ViewfinderCircleIcon, UserIcon } from "@heroicons/vue/24/solid";

const route = useRoute();

const menuLists = [
  {
    url: "/",
    label: "Бош саҳифа",
    icon: HomeIcon,
  },
  {
    url: "/filial",
    label: "Филиаллар",
    icon: BuildingOfficeIcon,
  },
  {
    url: "/rooms",
    label: "Хоналар",
    icon: BuildingOffice2Icon,
  },
  {
    url: "/category",
    label: "Тоифалар",
    icon: ChartBarIcon,
  },
  {
    url: "/product",
    label: "Маҳсулотлар",
    icon: WalletIcon,
  },
  {
    url: "/invoice",
    label: "Фактура",
    icon: ClipboardDocumentListIcon,
  },
  {
    url: "/employee",
    label: "Ходимлар",
    icon: UserIcon
  },
  {
    url: "/code",
    label: "Қр Кодлар",
    icon: ViewfinderCircleIcon
  },
];
</script>

<template>
  <div class="flex flex-col items-center border-r border-[#F5F7FA]">
    <div class="top-0 hidden lg:flex h-20 items-center justify-center py-4 text-[#5A67BA]  ">
      UMFT
    </div>
    <div class="flex justify-evenly lg:justify-start w-full lg:flex-col gap-4 overflow-auto py-4">
      <router-link v-for="list in menuLists" :key="list.url" :to="list.url" @cliick="$emit('close')"
        class="flex min-h-10 items-center gap-0 lg:gap-3 flex-col lg:flex-row ">
        <span class="mr-4 h-full w-[4px] rounded-r-full transition-all duration-300 ease-linear hidden lg:block"
          :class="{ '!bg-[#1814F3]': route.path == list.url }"></span>


        <component :is="list.icon" class="w-6 h-6 text-[#B1B1B1] transition duration-300 ease-in-out"
          :class="{ '!text-[#1814F3]': route.path == list.url }" />

        <span class="text-[#B1B1B1] font-medium transition duration-300 ease-in-out hidden lg:block"
          :class="{ '!text-[#1814F3]': route.path == list.url }">{{ list.label }}</span>

        <span class="mt-2 w-10 h-[2px] rounded-full transition-all duration-300 ease-linear  lg:hidden"
          :class="{ '!bg-[#1814F3]': route.path == list.url }"></span>
      </router-link>
    </div>
  </div>
</template>
