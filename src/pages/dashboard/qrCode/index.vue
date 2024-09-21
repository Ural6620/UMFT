<script setup>
import { ref, onMounted } from "vue";
import { saveAs } from "file-saver";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useQrCodeStore } from "@/stores/qrCode";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import {
  ArrowDownOnSquareStackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/solid";
import api from "@/plugins/axios";
import JSZip from "jszip";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const qrCodeStore = useQrCodeStore();
const roomStore = useRoomStore();
const productStore = useProductStore();
const showModal = ref(false);
const urlQrCode = ref("");
const qrCode = ref("");
const pageNum = ref(1);
const limit = 12;
const orderRoom = ref("");
const titleProduct = ref("");
const columns = [
  { name: "№" },
  { name: "Маҳсулот" },
  { name: "Модел" },
  { name: "Фактура" },
  { name: "Хона" },
  { name: "Ходим" },
  { name: "Нарҳ" },
  { name: "" },
];

async function downloadFile(item) {
  try {
    const fileUrl = `${api.defaults.baseURL}/files/qrcode/${item}.png`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = item.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Faylni yuklashda xatolik yuz berdi:", error);
  }
}

async function downloadAllFiles() {
  await qrCodeStore.getAll(0);
  const zip = new JSZip();
  const folder = zip.folder("qr_codes");
  try {
    const downloadPromises = qrCodeStore.qrCodes.map(async (item) => {
      const fileUrl = `http://195.158.9.124:4101/files/qrcode/${item._id}.png`;
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      folder.file(`${item._id}.png`, blob);
    });
    await Promise.all(downloadPromises);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "qr_codes.zip");
  } catch (error) {
    console.error("Fayllarni yuklashda xatolik yuz berdi:", error);
  }
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct.value);
}

async function showFile(item) {
  showModal.value = true;
  try {
    const fileUrl = `http://195.158.9.124:4101/files/qrcode/${item}.png`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    qrCode.value = item;
    urlQrCode.value = fileUrl;
  } catch (error) {
    console.error("Faylni yuklashda xatolik yuz berdi:", error);
  }
}

function closeFileModal() {
  urlQrCode.value = "";
  qrCode.value = "";
  showModal.value = false;
}

async function searchCode() {
  pageNum.value = 1;
  await qrCodeStore.getAll(
    limit,
    pageNum.value,
    titleProduct.value,
    orderRoom.value,
  );
}

async function goPage(n) {
  pageNum.value = n;
  await router.push({
    name: "qrCode",
    query: { page: pageNum.value, code: titleProduct.value },
  });
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct.value);
}

async function prewPage() {
  if (pageNum.value > 1) {
    pageNum.value--;
  }
  goPage(pageNum.value);
}

async function nextPage() {
  const maxPage = Math.ceil(qrCodeStore.count / limit);
  if (pageNum.value < maxPage) {
    pageNum.value++;
  }
  goPage(pageNum.value);
}

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    const queryPage = route.query.page || 1;
    const queryTitle = route.query.code;
    pageNum.value = Number(queryPage) || 1;
    titleProduct.value = queryTitle || "";
    await qrCodeStore.getAll(limit, pageNum.value, titleProduct.value);
    await roomStore.get(0);
    await productStore.get(0);
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});
</script>
<template>
  <div class="flex flex-col gap-4">
    <!-- Header Product -->
    <div class="flex items-center justify-between">
      <h3 class="text-main text-xl font-semibold">Қр Код</h3>
      <div class="flex items-center gap-4">
        <!-- Filter Product -->
        <SelectFilial
          placeholder="Маҳсулотни танланг"
          :data="productStore.products"
          class="col-span-3"
          v-model="titleProduct"
          @update:modelValue="searchCode"
          classes="w-32 lg:w-52"
        />
        <!-- /Filter Product -->

        <!-- Filter Room -->
        <SelectFilial
          placeholder="Хонани танланг"
          :data="roomStore.rooms"
          class="col-span-3"
          v-model="orderRoom"
          @update:modelValue="searchCode"
          classes="w-32 lg:w-52"
        />
        <!-- /Filter Room -->

        <!-- Download all qrCode -->
        <div class="flex items-center justify-end gap-4">
          <button
            @click.prevent="downloadAllFiles()"
            class="inline-flex items-center justify-center gap-1 rounded bg-yellow-100 p-2 transition ease-linear hover:bg-yellow-300"
          >
            <ArrowDownOnSquareStackIcon class="h-3.5 w-3.5 text-yellow-600" />
          </button>
        </div>
        <!-- /Download all qrCode -->
      </div>
    </div>
    <!-- /Header Product -->

    <!-- Table -->
    <div class="overflow-auto rounded-2xl bg-white py-2 lg:h-[640px]">
      <qrCodeTable
        :columns="columns"
        :data="qrCodeStore.qrCodes"
        :page="pageNum"
        :limit="limit"
        @download="downloadFile"
        @showQr="showFile"
        :count="qrCodeStore.count"
        :summa="qrCodeStore.summa"
      />
    </div>
    <!-- /Table -->

    <!-- Pagination -->
    <div class="text-main flex w-full items-center justify-end gap-2 px-10">
      <span class="flex cursor-pointer items-center" @click="prewPage">
        <ChevronLeftIcon class="h-4 w-4" />
      </span>
      <span
        v-if="pageNum > 2"
        class="cursor-pointer rounded-md px-2 transition-all ease-linear"
        :class="1 === pageNum ? 'bg-main text-white' : ''"
        @click="goPage(1)"
      >
        {{ 1 }}
      </span>
      <span v-if="pageNum > 2">...</span>
      <span
        v-if="pageNum > 1"
        class="cursor-pointer rounded-md px-2 transition-all ease-linear"
        @click="goPage(pageNum - 1)"
      >
        {{ pageNum - 1 }}
      </span>
      <span
        class="bg-main cursor-pointer rounded-md px-2 text-white transition-all ease-linear"
        @click="goPage(pageNum)"
      >
        {{ pageNum }}
      </span>
      <span
        v-if="pageNum < Math.ceil(qrCodeStore.count / limit) - 1"
        class="cursor-pointer rounded-md px-2 transition-all ease-linear"
        @click="goPage(pageNum + 1)"
      >
        {{ Number(pageNum) + 1 }}
      </span>
      <span v-if="pageNum < Math.ceil(qrCodeStore.count / limit) - 1">...</span>
      <span
        class="cursor-pointer rounded-md px-2 transition-all ease-linear"
        v-if="Math.ceil(qrCodeStore.count / limit) > pageNum"
        :class="
          Math.ceil(qrCodeStore.count / limit) === pageNum
            ? 'bg-main text-white'
            : ''
        "
        @click="goPage(Math.ceil(qrCodeStore.count / limit))"
      >
        {{ Math.ceil(qrCodeStore.count / limit) }}
      </span>
      <span class="flex cursor-pointer items-center gap-1" @click="nextPage">
        <ChevronRightIcon class="h-4 w-4" />
      </span>
    </div>
    <!-- /Pagination-->

    <!-- Modal -->
    <Teleport to="body">
      <BaseModal :show="showModal" @close="closeFileModal">
        <template #header>Қр Код: {{ qrCode }} </template>
        <template #body>
          <div class="flex items-center justify-center p-20">
            <img class="h-64 w-64" :src="urlQrCode" alt="Qr Code" />
          </div>
        </template>
      </BaseModal>
    </Teleport>
    <!-- /Modal -->
  </div>
</template>
