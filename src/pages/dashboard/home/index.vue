<script setup>
import { onMounted } from "vue";
import { useFilialStore } from "@/stores/filial";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import { useInvoiceStore } from "@/stores/invoice";
import { useQrCodeStore } from "@/stores/qrCode";
import { useEmployeeStore } from "@/stores/employee";
import { useCategoryStore } from "@/stores/category";
import { useRouter } from "vue-router";

const router = useRouter();
const filialStore = useFilialStore();
const roomStore = useRoomStore();
const productStore = useProductStore();
const invoiceStore = useInvoiceStore();
const qrCodeStore = useQrCodeStore();
const employeeStore = useEmployeeStore();
const categoryStore = useCategoryStore();

onMounted(async () => {
  await Promise.all([
    filialStore.get(0),
    roomStore.get(0),
    productStore.get(0),
    invoiceStore.get(0),
    qrCodeStore.getAll(0),
    employeeStore.get(0),
    categoryStore.get(0),
  ]);

});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header Category -->
    <div class="flex items-center justify-between">
      <h3 class="text-main text-xl font-semibold">Статистика</h3>
    </div>

    <div class="grid grid-cols-2 gap-10 lg:grid-cols-4">
      <div @click="router.push('/filial')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Филиаллар</h4>
        <p class="pb-6 text-center text-5xl font-bold">
          {{ filialStore.count }}
        </p>
      </div>

      <div @click="router.push('/rooms')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Хоналар</h4>
        <p class="pb-6 text-center text-5xl font-bold">{{ roomStore.count }}</p>
      </div>

      <div @click="router.push('/category')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Тоифалар</h4>
        <p class="pb-6 text-center text-5xl font-bold">
          {{ categoryStore.count }}
        </p>
      </div>

      <div @click="router.push('/product')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Маҳсулотлар</h4>
        <p class="pb-6 text-center text-5xl font-bold">
          {{ productStore.count }}
        </p>
      </div>

      <div @click="router.push('/invoice')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Фактура</h4>
        <p class="pb-6 text-center text-5xl font-bold">
          {{ invoiceStore.count }}
        </p>
      </div>

      <div @click="router.push('/code')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Қр Кодлар</h4>
        <p class="pb-6 text-center text-5xl font-bold">
          {{ qrCodeStore.count }}
        </p>
      </div>

      <div @click="router.push('/employee')" class="flex h-auto cursor-pointer flex-col rounded-xl bg-white px-4 py-2">
        <h4 class="text-md text-main">Ишчилар</h4>
        <p class="pb-6 text-center text-5xl font-bold">
          {{ employeeStore.count }}
        </p>
      </div>
    </div>
    <!-- /Header Category -->
  </div>
</template>
