<script setup>
import { onMounted } from "vue";
import { useAuthStore } from '@/stores/auth';
import { useFilialStore } from "@/stores/filial";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import { useInvoiceStore } from "@/stores/invoice";
import { useQrCodeStore } from "@/stores/qrCode";
import { useEmployeeStore } from "@/stores/employee";
import { useCategoryStore } from "@/stores/category";
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const filialStore = useFilialStore();
const roomStore = useRoomStore();
const productStore = useProductStore();
const invoiceStore = useInvoiceStore();
const qrCodeStore = useQrCodeStore();
const employeeStore = useEmployeeStore();
const categoryStore = useCategoryStore();

onMounted(async () => {
  try {
    await authStore.checkAuth();
    if (authStore.isAuthenticated) {
      await Promise.all([
        filialStore.get(0),
        roomStore.get(0),
        productStore.get(0),
        invoiceStore.get(0),
        qrCodeStore.getAll(0),
        employeeStore.get(0),
        categoryStore.get(0),
      ]);
    } else {
      console.error("Autentifikatsiya muvaffaqiyatsiz");
    }
  } catch (error) {
    console.error("Xato ro'y berdi: ", error);
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header Category -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl text-[#1814F3] font-semibold">Статистика</h3>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-10">

      <div @click="router.push('/filial')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Филиаллар</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ filialStore.count }}</p>
      </div>

      <div @click="router.push('/rooms')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Хоналар</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ roomStore.count }}</p>
      </div>

      <div @click="router.push('/category')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Тоифалар</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ categoryStore.count }}</p>
      </div>

      <div @click="router.push('/product')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Маҳсулотлар</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ productStore.count }}</p>
      </div>

      <div @click="router.push('/invoice')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Фактура</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ invoiceStore.count }}</p>
      </div>

      <div @click="router.push('/code')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Қр Кодлар</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ qrCodeStore.count }}</p>
      </div>

      <div @click="router.push('/employee')" class="h-auto bg-white rounded-xl py-2 flex flex-col px-4 cursor-pointer">
        <h4 class="text-md text-[#1814F3]">Ишчилар</h4>
        <p class="text-5xl font-bold text-center pb-6">{{ employeeStore.count }}</p>
      </div>
    </div>
    <!-- /Header Category -->
  </div>
</template>