<script setup>
import { useRoute } from "vue-router";
import {
  HomeIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  WalletIcon,
  ViewfinderCircleIcon,
  UserIcon,
} from "@heroicons/vue/24/solid";

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
    icon: UserIcon,
  },
  {
    url: "/code",
    label: "Қр Кодлар",
    icon: ViewfinderCircleIcon,
  },
];
</script>

<template>
  <div class="flex flex-col items-center border-r border-[#F5F7FA]">
    <div
      class="top-0 hidden h-20 items-center justify-center p-4 py-4 text-[#5A67BA] lg:flex"
    >
      <img src="@/assets/logo.svg" alt="" class="w-full max-w-[200px]" />
    </div>
    <div
      class="flex w-full justify-evenly gap-4 overflow-auto py-4 lg:flex-col lg:justify-start"
    >
      <router-link
        v-for="list in menuLists"
        :key="list.url"
        :to="list.url"
        @cliick="$emit('close')"
        class="flex min-h-10 flex-col items-center gap-0 lg:flex-row lg:gap-3"
      >
        <span
          class="mr-4 hidden h-full w-[4px] rounded-r-full transition-all duration-300 ease-linear lg:block"
          :class="{ '!bg-main': route.path == list.url }"
        ></span>

        <component
          :is="list.icon"
          class="h-6 w-6 text-[#B1B1B1] transition duration-300 ease-in-out"
          :class="{ '!text-main': route.path == list.url }"
        />

        <span
          class="hidden font-medium text-[#B1B1B1] transition duration-300 ease-in-out lg:block"
          :class="{ '!text-main': route.path == list.url }"
          >{{ list.label }}</span
        >

        <span
          class="mt-2 h-[2px] w-10 rounded-full transition-all duration-300 ease-linear lg:hidden"
          :class="{ '!bg-main': route.path == list.url }"
        ></span>
      </router-link>
    </div>
  </div>
</template>
