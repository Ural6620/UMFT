<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useFilialStore } from "@/stores/filial";
import { useRoute, useRouter } from "vue-router";
import { PlusIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { useQrCodeStore } from "@/stores/qrCode";
import { colFilial, colInfo } from "@/components/constants/constants";
import api from "@/plugins/axios";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import FilialTable from "@/components/table/FilialTable.vue";
import Pagination from "@/components/ui/Pagination.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";


const route = useRoute();
const router = useRouter();
const filialStore = useFilialStore();
const qrCodeStore = useQrCodeStore();
const showModal = ref(false);
const isDelete = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const pageInfo = ref(1);
const qrCode = ref("");
const urlQrCode = ref("");
const pageNum = ref(1);
const titleFilial = ref("");
const limit = 12;
const limitQrCode = 14;
const filialId = ref("");
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);
const isDeleteEmployee = ref(false);
const alert = ref('');

const form = reactive({
  img: "",
  title: "",
  number: "",
  address: "",
});

const formEmployee = reactive({
  _id: '',
  employee: null,
  room: '',
  price: 0,
  invoice: '',
  product: ''
})

async function handleImage(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  try {
    let image = await filialStore.uploadFilial(formData);
    form.img = image.data;
  } catch (error) {
    console.error("Rasm yuklashda xatolik:", error);
  }
}

const handleDelete = async () => {
  try {
    pageNum.value = 1;
    await filialStore.deleteFilial(filialStore.filialById?._id);
    await filialStore.get(limit, pageNum.value, titleFilial.value);
    isDelete.value = false;
  } catch (error) {
    console.error("O'chirishda xatolik:", error);
  }
};

const handleEdite = async (id) => {
  try {
    await filialStore.getFilialById(id);
    form.img = filialStore.filialById.img;
    form._id = filialStore.filialById._id;
    form.title = filialStore.filialById.title;
    form.number = filialStore.filialById.number;
    form.address = filialStore.filialById.address;
    showModal.value = true;
  } catch (error) {
    console.error("Tahrirlashda xatolik:", error);
  }
};

async function submitForm() {
  if (!form.img) {
    alert.value = 'Расм юкланг';
  } else if (!form.title) {
    alert.value = 'Филал номини киритинг';
  } else if (!form.number) {
    alert.value = 'Филал рақами киритинг';
  } else if (!form.address) {
    alert.value = 'Филал манзили киритинг';
  } else {
    if (!form._id) {
      await filialStore.addFilial(form);
    } else {
      await filialStore.updateFilial(form);
    }
    await filialStore.get(limit, pageNum.value, titleFilial.value);
    showModal.value = false;
    resetForm();
  }

}

function openDelete(id) {
  filialStore.getFilialById(id);
  isDelete.value = true;
}

function resetForm() {
  delete form?._id;
  form.img = "";
  form.title = "";
  form.number = "";
  form.address = "";
  alert.value = '';
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", "", '', '', '', '', filialId.value);
  } else {
    pageNum.value = n;
    router.push({
      name: "filial",
      query: { page: pageNum.value, filial: titleFilial.value },
    });
    filialStore.get(limit, pageNum.value, titleFilial.value);
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", "", '', '', '', '', filialId.value);
  } else {
    if (pageNum.value > 1) {
      pageNum.value--;
    }
    await goPage(pageNum.value);
  }
}

async function nextPage(item) {
  if (item === "info") {
    if (pageInfo.value < Math.ceil(qrCodeStore.count / limitQrCode)) {
      pageInfo.value++;
    }
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", "", '', '', '', '', filialId.value);
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function filter() {
  isMobile.value = false;
  pageNum.value = 1;
  router.push({
    name: "filial",
    query: { page: pageNum.value, filial: titleFilial.value },
  });
  await filialStore.get(limit, pageNum.value, titleFilial.value);
}
async function openInfo(id) {
  isInfo.value = true;
  filialId.value = id;
  await filialStore.getFilialById(id);
  await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", "", '', '', '', '', filialId.value);
}
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

async function showFile(item) {
  showQr.value = true;
  isInfo.value = false;
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
  showQr.value = false;
  qrCode.value = "";
  urlQrCode.value = "";
  isInfo.value = true;
}

function closeInfo() {
  pageInfo.value = 1;
  isInfo.value = false;
}

function openModal() {
  isMobile.value = false;
  showModal.value = true;
}

function clear() {
  titleFilial.value = "";
  pageNum.value = 1;
  router.push({
    name: "filial",
    query: { page: pageNum.value, filial: titleFilial.value },
  });
  filialStore.get(limit, pageNum.value, titleFilial.value);
}

function handleResize() {
  isLargeScreen.value = window.innerWidth > 760;
}

async function reload(id) {
  isInfo.value = false;
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
  qrCodeStore.getAll(limitQrCode, pageInfo.value, "", "", '', '', '', '', filialId.value);
  isInfo.value = true;
}

function closeEmployee() {
  isDeleteEmployee.value = false;
  isInfo.value = true;
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  const queryPage = Number(route.query.page) || 1;
  const queryFilialTitle = route.query.filial || "";

  pageNum.value = queryPage;
  titleFilial.value = queryFilialTitle;
  await filialStore.get(limit, pageNum.value, titleFilial.value);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <!-- Header Category -->
  <div v-if="isLargeScreen" class="flex items-center justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Филиал</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-56 rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Филиал номи" v-model="titleFilial" />

      <BaseButton @click="filter" color="blue">
        <MagnifyingGlassIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="orange">
        <XMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="openModal" color="green">
        <PlusIcon class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>

  <div v-else class="flex justify-between  items-center relative">
    <h3 class="text-main text-xl font-semibold">Филиал</h3>
    <BaseButton @click="isMobile = true" color="main">
      <Bars3Icon class="h-6 w-6" />
    </BaseButton>

    <div v-if="isMobile" class="flex flex-col absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <BaseButton @click="isMobile = false" class="w-fit absolute top-4 right-4">
        <XMarkIcon class="h-5 w-5" />
      </BaseButton>
      <!-- Filter title -->
      <div class="flex flex-col gap-4 w-full mt-10">
        <input type="text"
          class="text-main focus:border-main w-full text-xl rounded-md border px-4 py-2 placeholder:text-[#8BA3CB] focus:outline-none"
          placeholder="Филиал номи" v-model="titleFilial" />
        <div class="flex gap-4">
          <BaseButton @click="filter" color="blue" class="w-1/2">
            <MagnifyingGlassIcon class="h-5 w-5" />
          </BaseButton>
          <BaseButton @click="clear" color="orange" class="w-1/2">
            <XMarkIcon class="h-5 w-5" />
          </BaseButton>
          <BaseButton @click="openModal" color="green" class="w-1/2">
            <PlusIcon class="h-5 w-5" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
  <!-- /Header Category -->

  <!-- Table -->
  <div class="flex-1 overflow-auto rounded-2xl bg-white py-2">
    <FilialTable :columns="colFilial" :data="filialStore.filials" @delete="openDelete" @edite="handleEdite"
      :page="pageNum" :limit="limit" @main="openInfo" />
  </div>
  <!-- /Table -->

  <!-- Pagination -->
  <Pagination :page="pageNum" :limit="limit" :data="filialStore.filials" @goPage="goPage" @next="nextPage"
    @prew="prewPage" />
  <!-- /Pagination-->

  <!-- Modal -->
  <Teleport to="body">
    <!-- Add end Create Modal -->
    <BaseModal :show="showModal" @close="closeModal">
      <template #header>
        <p>Филиал{{ form._id ? "ни Узгартириш" : " яратиш" }}</p>
        <p class="text-red-500">{{ alert }}</p>
      </template>
      <template #body>
        <BaseForm class="grid grid-cols-2 gap-2">
          <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
            classes="py-1 lg:py-1.5" @change="handleImage" />
          <BaseInput v-model="form.title" label="Номи" placeholder="Номи" inputType="string" />
          <BaseInput v-model="form.number" label="Рақами" placeholder="Рақами" inputType="number" />
          <BaseInput v-model="form.address" label="Манзили" placeholder="Манзили" inputType="string" />
        </BaseForm>
      </template>
      <template #button>
        <BaseButton class="w-32" @click="submitForm" color="green">
          Сақлаш
        </BaseButton>
      </template>
    </BaseModal>
    <!-- /Add end Create Modal -->

    <!-- Delete Modal -->
    <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
      <div class="flex justify-center">
        <p class="text-gray-500">
          Сиз
          <span class="capitalize text-red-400">
            {{ filialStore.filialById?.title }}
          </span>
          филифлини учирмоқдасиз!
        </p>
      </div>
    </DeleteModal>

    <!-- /Delete Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Filial: {{ filialStore.filialById?.title }}</template>
      <template #body>
        <div v-if="!qrCodeStore.qrCodes.length"
          class="text-main overflow-auto rounded-2xl bg-white py-2 text-center h-96">
          Бу филиалга маҳсулот бириктирилмаган
        </div>
        <div v-else class="overflow-auto rounded-2xl bg-white py-2 min-h-[560px] lg:min-h-[750px]">
          <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="limitQrCode"
            :count="qrCodeStore.count" :summa="qrCodeStore.summa" @download="downloadFile" @showQr="showFile"
            @reload="reload" />
        </div>
      </template>
      <template #footer>
        <!-- Pagination -->
        <Pagination :page="pageInfo" :limit="limitQrCode" :data="qrCodeStore" @next="nextPage('info')"
          @prew="prewPage('info')" @goPage="goPage($event, 'info')" />
        <!-- /Pagination-->
      </template>
    </InfoRoomModal>
    <!-- /Info Modal -->

    <!-- showModal -->
    <BaseModal :show="showQr" @close="closeFileModal">
      <template #header>Қр Код: {{ qrCode }} </template>
      <template #body>
        <div class="flex items-center justify-center p-20">
          <img class="h-64 w-64" :src="urlQrCode" alt="Qr Code" />
        </div>
      </template>
    </BaseModal>
    <!-- /showModal -->
    <!-- Delete employee -->
    <DeleteModal :show="isDeleteEmployee" @close="closeEmployee" @delete="handleDeleteEmployee">
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
    <!-- /Delete employee -->
  </Teleport>
  <!-- /Modal  -->

</template>
