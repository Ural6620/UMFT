<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { saveAs } from "file-saver";
import { useRoute, useRouter } from "vue-router";
import { useQrCodeStore } from "@/stores/qrCode";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import { useEmployeeStore } from "@/stores/employee";
import { ArrowDownOnSquareStackIcon, XMarkIcon, Bars3Icon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { colInfo } from "@/components/constants/constants";
import api from "@/plugins/axios";
import JSZip from "jszip";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import Pagination from "@/components/ui/Pagination.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import SelectQr from "@/components/form/selectQr.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";

const route = useRoute();
const router = useRouter();
const qrCodeStore = useQrCodeStore();
const roomStore = useRoomStore();
const productStore = useProductStore();
const employeeStore = useEmployeeStore();
const showModal = ref(false);
const urlQrCode = ref("");
const qrCode = ref("");
const pageNum = ref(1);
const limit = 30;
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);
const isDownloadModal = ref(false);
const isDeleteEmployee = ref(false);
const titleProduct = reactive({
  _id: "",
  title: "Маҳсулотни танланг"
})

const titleRoom = reactive({
  _id: "",
  title: "Хонани танланг"
})

const formEmployee = reactive({
  _id: '',
  employee: null,
  room: '',
  price: 0,
  invoice: '',
  product: ''
})

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

function openDownload() {
  isDownloadModal.value = true;
}

async function closeDownload() {
  titleProduct._id = "";
  titleRoom._id = "";
  titleProduct.title = "Маҳсулотни танланг";
  titleRoom.title = "Хонани танланг";
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct._id);
  isDownloadModal.value = false;
}

function clearProduct() {
  titleProduct._id = "";
  titleProduct.title = "Маҳсулотни танланг";
}


function clearRoom() {
  titleRoom._id = "";
  titleRoom.title = "Хонани танланг";
}

async function downloadAllFiles() {
  isMobile.value = false;
  await qrCodeStore.getAll(0, 1, titleProduct._id, titleRoom._id);
  const zip = new JSZip();
  const folder = zip.folder("qr_codes");
  try {
    const downloadPromises = qrCodeStore.qrCodes.map(async (item) => {
      const fileUrl = `${api.defaults.baseURL}/files/qrcode/${item._id}.png`;
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
  titleProduct._id = "";
  titleRoom._id = "";
  titleProduct.title = "Маҳсулотни танланг";
  titleRoom.title = "Хонани танланг";
  pageNum.value = 1;
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct._id);
  isDownloadModal.value = false;
}

async function showFile(item) {
  showModal.value = true;
  try {
    const fileUrl = `${api.defaults.baseURL}/files/qrcode/${item}.png`;
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

async function filter() {
  pageNum.value = 1;
  await router.push({
    name: "qrCode",
    query: { page: pageNum.value, product: titleProduct._id, room: titleRoom._id, titleProduct: titleProduct.title, titleRoom: titleRoom.title },
  });
  await qrCodeStore.getAll(
    limit,
    pageNum.value,
    titleProduct._id,
    titleRoom._id);
  isMobile.value = false;
}

async function goPage(n) {
  pageNum.value = n;
  await router.push({
    name: "qrCode",
    query: { page: pageNum.value, product: titleProduct._id, room: titleRoom._id },
  });
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct._id);
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

async function clear() {
  titleProduct._id = "";
  titleRoom._id = "";
  titleProduct.title = "Маҳсулотни танланг";
  titleRoom.title = "Хонани танланг";
  pageNum.value = 1;
  await router.push({
    name: "qrCode",
    query: { page: pageNum.value, product: titleProduct._id, room: titleRoom._id, titleProduct: titleProduct.title, titleRoom: titleRoom.title },
  });
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct._id);
}

function handleResize() {
  isLargeScreen.value = window.innerWidth > 760;
}

function handleProduct(newProduct) {
  titleProduct._id = newProduct._id;
  titleProduct.title = newProduct.title;
}

function handleRoom(newRoom) {
  titleRoom._id = newRoom._id;
  titleRoom.title = newRoom.title;
}

async function reload(id) {
  isDeleteEmployee.value = true;
  await qrCodeStore.getQrCodeById(id);
}

async function handleDeleteEmployee() {
  formEmployee._id = qrCodeStore.qrcodeById?._id;
  formEmployee.employee = null;
  formEmployee.room = qrCodeStore.qrcodeById?.room?._id;
  formEmployee.price = qrCodeStore.qrcodeById?.price;
  formEmployee.invoice = qrCodeStore.qrcodeById?.invoice?._id;
  formEmployee.product = qrCodeStore.qrcodeById?.product?._id;
  await qrCodeStore.updateQrCode(formEmployee);
  isDeleteEmployee.value = false;
  qrCodeStore.getAll(limit, pageNum.value, titleProduct._id, titleRoom._id);
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  const queryPage = route.query.page || 1;
  const queryProduct = route.query.product || '';
  const queryRoom = route.query.room || '';
  const queryTitleRoom = route.query.titleRoom;
  const queryTitleProduct = route.query.titleProduct;
  pageNum.value = Number(queryPage) || 1;
  titleProduct._id = queryProduct || "";
  titleRoom._id = queryRoom || "";
  titleProduct.title = queryTitleProduct || "Маҳсулотни танланг";
  titleRoom.title = queryTitleRoom || "Хонани танланг";
  await router.push({
    name: "qrCode",
    query: { page: pageNum.value, product: titleProduct._id, room: titleRoom._id },
  });
  await qrCodeStore.getAll(limit, pageNum.value, titleProduct._id, titleRoom._id);
  await roomStore.get(0);
  await productStore.get(0);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
<template>
  <!-- Header Qr Code -->
  <div v-if="isLargeScreen" class="flex items-baseline justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Қр Код</h3>
    <div class="flex items-baseline gap-4">
      <!-- Filter Qr Code -->
      <SelectQr :placeholder="titleProduct" :data="productStore.products" class="w-52" @update="handleProduct" />
      <!-- /Filter Qr Code -->

      <!-- Filter Room -->
      <SelectQr :placeholder="titleRoom" :data="roomStore.rooms" class="w-52" @update="handleRoom" />
      <!-- /Filter Room -->

      <!-- Download all qrCode -->
      <div class="flex items-center justify-end gap-4">
        <BaseButton @click="filter" color="blue">
          <MagnifyingGlassIcon class="h-4 w-4" />
        </BaseButton>
        <BaseButton @click="clear" color="orange">
          <XMarkIcon class="h-4 w-4" />
        </BaseButton>
        <BaseButton @click="openDownload" color="green">
          <ArrowDownOnSquareStackIcon class="h-4 w-4" />
        </BaseButton>
      </div>
      <!-- /Download all qrCode -->
    </div>
  </div>
  <div v-else class="flex justify-between items-center relative">
    <h3 class="text-main text-xl font-semibold">Қр Код</h3>
    <BaseButton @click="isMobile = true" color="main">
      <Bars3Icon class="h-6 w-6" />
    </BaseButton>
    <div v-if="isMobile"
      class="flex flex-col items-center absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <!-- Filter Qr Code -->
      <SelectQr :placeholder="titleProduct" :data="productStore.products" class="w-full" @update="handleProduct" />
      <!-- /Filter Qr Code -->

      <!-- Filter Room -->
      <SelectQr :placeholder="titleRoom" :data="roomStore.rooms" class="w-full" @update="handleRoom" />
      <!-- /Filter Room -->
      <BaseButton @click="filter" color="blue" class="w-1/2">
        <MagnifyingGlassIcon class="h-5 w-5" />
      </BaseButton>
      <BaseButton @click="clear" color="orange" class="w-1/2">
        <XMarkIcon class="h-5 w-5" />
      </BaseButton>
      <BaseButton @click="openDownload" color="green" class="w-1/2">
        <ArrowDownOnSquareStackIcon class="h-5 w-5" />
      </BaseButton>
    </div>
    <div v-if="isMobile" class="flex flex-col absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <BaseButton @click="isMobile = false" class="w-fit absolute top-4 right-4">
        <XMarkIcon class="h-5 w-5" />
      </BaseButton>
      <!-- Filter title -->
      <div class="flex flex-col gap-4 w-full mt-10">
        <!-- Filter Qr Code -->
        <SelectQr :placeholder="titleProduct" :data="productStore.products" class="w-full" @update="handleProduct" />
        <!-- /Filter Qr Code -->

        <!-- Filter Room -->
        <SelectQr :placeholder="titleRoom" :data="roomStore.rooms" class="w-full" @update="handleRoom" />
        <!-- /Filter Room -->
        <div class="flex gap-4">
          <BaseButton @click="filter" color="blue" class="w-1/2">
            <MagnifyingGlassIcon class="h-5 w-5" />
          </BaseButton>
          <BaseButton @click="clear" color="orange" class="w-1/2">
            <XMarkIcon class="h-5 w-5" />
          </BaseButton>
          <BaseButton @click="openDownload" color="green" class="w-1/2">
            <ArrowDownOnSquareStackIcon class="h-5 w-5" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
  <!-- /Header Qr Code -->

  <!-- Table -->
  <div class="overflow-auto rounded-2xl bg-white flex-1">
    <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageNum" :limit="limit" @download="downloadFile"
      @showQr="showFile" :count="qrCodeStore.count" :summa="qrCodeStore.summa" @reload="reload" />
  </div>
  <!-- /Table -->

  <!-- Pagination -->
  <div class="text-main flex w-full items-center justify-end gap-2 px-10">
    <Pagination :page="pageNum" :limit="limit" :data="qrCodeStore" @next="nextPage" @prew="prewPage" @goPage="goPage" />
  </div>
  <!--
      /Pagination-->

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
    <BaseModal :show="isDownloadModal" @close="closeDownload">
      <template #header> Қр Код юклаш </template>
      <template #body>
        <div class="flex flex-col gap-4 items-center justify-center p-10">
          <!-- Filter Qr Code -->
          <div class="flex gap-2 items-baseline w-full lg:w-1/2">
            <SelectQr :placeholder="titleProduct" :data="productStore.products" class="flex-1"
              @update="handleProduct" />
            <BaseButton @click="clearProduct" color="orange">
              <XMarkIcon class="h-4 w-4 " />
            </BaseButton>
          </div>
          <!-- /Filter Qr Code -->

          <!-- Filter Room -->
          <div class="flex gap-2 items-baseline w-full lg:w-1/2">
            <SelectQr :placeholder="titleRoom" :data="roomStore.rooms" class="flex-1" @update="handleRoom" />
            <BaseButton @click="clearRoom" color="orange">
              <XMarkIcon class="h-4 w-4" />
            </BaseButton>
          </div>
          <!-- /Filter Room -->

          <BaseButton @click="downloadAllFiles()" color="blue" class="w-full lg:w-1/2">
            Қр Кодларни юклаш
          </BaseButton>

        </div>
      </template>
    </BaseModal>
    <DeleteModal :show="isDeleteEmployee" @close="isDeleteEmployee = false" @delete="handleDeleteEmployee">
      <div class="flex justify-center">
        <p class="text-gray-500">
          Сиз
          <span class="capitalize text-red-400">{{
            qrCodeStore.qrcodeById?.employee?.full_name
          }}</span>
          xodimdan
          <span class="capitalize text-red-400">{{
            qrCodeStore.qrcodeById?.product?.title
          }}</span>
          маҳсулотини учирмоқдасиз!
        </p>
      </div>
    </DeleteModal>
  </Teleport>
  <!-- /Modal -->

</template>
