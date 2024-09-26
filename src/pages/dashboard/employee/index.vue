<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmployeeStore } from "@/stores/employee";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import { useQrCodeStore } from "@/stores/qrCode";
import { ArrowPathIcon, TrashIcon, EyeIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, PlusIcon, ArrowUturnLeftIcon } from "@heroicons/vue/24/solid";
import { colEmployee } from "@/components/constants/constants";
import { QrcodeStream } from 'vue-qrcode-reader'
import api from "@/plugins/axios";
import EmployeeTable from "@/components/table/EmployeeTable.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import InvoiceModal from "@/components/ui/InvoiceModal.vue";
import SelectDepartment from "@/components/form/SelectDepartment.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import Pagination from "@/components/ui/Pagination.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();
const roomStore = useRoomStore();
const productStore = useProductStore();
const qrCodeStore = useQrCodeStore();
const showModal = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const pageInfo = ref(1);
const empoyeeId = ref("");
const pageNum = ref(1);
const limit = 30;
const titleEmployee = ref("");
const codeDepartment = reactive({
  name: "Кафедрани танланг",
  code: ""
});
const qrCode = ref("");
const urlQrCode = ref("");
const errorEl = ref('');
const isCameraActive = ref(false);
const selectedConstraints = ref({ facingMode: 'environment' });
const currentIndex = ref(null);
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);
const alert = ref('')

const form = reactive({
  employee: "",
  inventories: [
    {
      room: "",
      product: "",
      _id: "",
    },
  ],
});


function addInvoice(index) {
  if (form.inventories[index]?._id) {
    form.inventories.push({
      room: "",
      product: "",
      _id: "",
    });
  }
}

function removeInvoice(index, length) {
  if (length > 1) {
    form.inventories.splice(index, 1);
  }
}

async function openModal(id) {
  await roomStore.get(0);
  await productStore.get(0);
  form.employee = id;
  showModal.value = true;
}

function closeModal() {
  resetForm();
  showModal.value = false;
}

function resetForm() {
  form.employee = "";
  alert.value = ""
  form.inventories = [
    {
      room: '',
      product: '',
      _id: "",
    },
  ];
}

async function synchronAll() {
  await employeeStore.patch();
  isMobile.value = false;
}

function submitForm() {
  if (!form.inventories[form.inventories.length - 1]._id) {
    alert.value = 'Қр кодни сканерланг'
  } else {
    employeeStore.editeEmployee(form);
    closeModal();
  }
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(
      limit,
      pageInfo.value,
      "",
      "",
      "",
      "",
      empoyeeId.value,
    );
  } else {
    pageNum.value = n;
    router.push({
      name: "employee",
      query: { page: pageNum.value, employee: titleEmployee.value, code: codeDepartment.code },
    });
    await employeeStore.get(
      limit,
      pageNum.value,
      titleEmployee.value,
      codeDepartment.code,
    );
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(
      limit,
      pageInfo.value,
      "",
      "",
      "",
      "",
      empoyeeId.value,
    );
  } else {
    if (pageNum.value > 1) {
      pageNum.value--;
    }
    await goPage(pageNum.value);
  }
}

async function nextPage(item) {
  if (item === "info") {
    if (pageInfo.value < Math.ceil(qrCodeStore.count / limit)) {
      pageInfo.value++;
    }
    await qrCodeStore.getAll(
      limit,
      pageInfo.value,
      "",
      "",
      "",
      "",
      empoyeeId.value,
    );
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function filter() {
  pageNum.value = 1;
  console.log(codeDepartment)
  router.push({
    name: "employee",
    query: { page: pageNum.value, code: codeDepartment.code, employee: titleEmployee.value },
  });
  await employeeStore.get(
    limit,
    pageNum.value,
    titleEmployee.value,
    codeDepartment.code,
  );
  isMobile.value = false;
}

async function openInfo(id) {
  isInfo.value = true;
  empoyeeId.value = id;
  // await employeeStore.getEmployeeById(id);
  await qrCodeStore.getAll(limit, pageInfo.value, "", "", "", "", empoyeeId.value);
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

function clear() {
  titleEmployee.value = "";
  codeDepartment.code = "";
  codeDepartment.name = "Кафедрани танланг";
  pageNum.value = 1;
  router.push({
    name: "employee",
    query: { page: pageNum.value, employee: titleEmployee.value },
  });
  employeeStore.get(limit, pageNum.value, titleEmployee.value, codeDepartment.code);
}

function openCamera(index) {
  currentIndex.value = index;
  isCameraActive.value = true;
  showModal.value = false;
}

async function onDetect(detectedCodes) {
  try {
    if (currentIndex.value === null) {
      console.error("Current index is not set!");
      return;
    }
    console.log(detectedCodes[0]?.rawValue);
    const arr = detectedCodes[0]?.rawValue.split('/');
    const id = arr[arr.length - 1];

    try {
      await qrCodeStore.getQrCodeById(id);
    } catch (error) {
      errorEl.value = 'Xatolik qayta urinib ko\'ring';
      isCameraActive.value = false;
      showModal.value = true;
      return;
    }

    const { product, room } = qrCodeStore.qrcodeById;
    await productStore.getProductById(product._id);
    if (currentIndex.value !== null) {
      form.inventories[currentIndex.value].room = room._id;
      form.inventories[currentIndex.value].product = productStore.productById?.title
      form.inventories[currentIndex.value]._id = id;
    }

    isCameraActive.value = false;
    showModal.value = true;
    currentIndex.value = null;
    errorEl.value = ''

  } catch (error) {
    errorEl.value = 'Xonaga biriktirilmagan QR kod';
    isCameraActive.value = false;
    showModal.value = true;
  }
}

function closeCamera() {
  isCameraActive.value = false;
  showModal.value = true;
  errorEl.value = ''
}

function switchCamera() {
  selectedConstraints.value =
    selectedConstraints.value.facingMode === 'environment'
      ? { facingMode: 'user' }
      : { facingMode: 'environment' }
}

function handleResize() {
  isLargeScreen.value = window.innerWidth > 760;
}


function handleUpdate(newDepartment) {
  codeDepartment.name = newDepartment.name;
  codeDepartment.code = newDepartment.code;
}

function reload() {
  qrCodeStore.getAll(limit, pageInfo.value, "", "", "", "", empoyeeId.value);
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  const queryPage = route.query.page || 1;
  const queryTitle = route.query.employee;
  const queryCode = route.query.code;
  pageNum.value = queryPage;
  titleEmployee.value = queryTitle;
  codeDepartment.code = queryCode;
  await employeeStore.get(
    limit,
    pageNum.value,
    titleEmployee.value,
    codeDepartment.code,
  );
  await employeeStore.getDepartment();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
<template>
  <!-- Header Product -->
  <div v-if="isLargeScreen" class="flex items-center justify-between pb-2 relative">
    <h3 class="text-main text-xl font-semibold">Ходим</h3>
    <div class="flex items-center gap-4">
      <!-- Filter Department -->
      <SelectDepartment :placeholder="codeDepartment" :data="employeeStore.departments" class="w-64"
        @update="handleUpdate" />
      <!-- /Filter Department -->

      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-64 rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="ФИО" v-model="titleEmployee" @input="searchFullName" />
      <!-- /Filter title -->

      <BaseButton @click="filter" color="blue">
        <MagnifyingGlassIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="orange">
        <XMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click.prevent="synchronAll()" color="green">
        <ArrowPathIcon class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>

  <div v-else class="flex justify-between  items-center relative">
    <h3 class="text-main text-xl font-semibold">Ходим</h3>
    <BaseButton @click="isMobile = true" color="main">
      <Bars3Icon class="h-6 w-6" />
    </BaseButton>

    <div v-if="isMobile" class="flex flex-col absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <BaseButton @click="isMobile = false" class="w-fit absolute top-4 right-4">
        <XMarkIcon class="h-5 w-5" />
      </BaseButton>
      <!-- Filter title -->
      <div class="flex flex-col gap-4 w-full mt-10">
        <!-- Filter Department -->
        <SelectDepartment :placeholder="codeDepartment" :data="employeeStore.departments" class="w-full" classes="py-2"
          @update="handleUpdate" />
        <!-- /Filter Department -->

        <!-- Filter title -->
        <input type="text"
          class="text-main focus:border-main w-full rounded-md border px-3 py-2 placeholder:text-[#8BA3CB] focus:outline-none lg:w-40"
          placeholder="ФИО" v-model="titleEmployee" @input="searchFullName" />
        <!-- /Filter title -->

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
  <!-- /Header Product -->

  <!-- Table -->
  <div class="overflow-auto rounded-2xl bg-white flex-1">
    <EmployeeTable :columns="colEmployee" :data="employeeStore.employees" :page="pageNum" :limit="limit"
      @edite="openModal" @main="openInfo" />
  </div>
  <!-- /Table -->

  <!-- Pagination -->
  <Pagination :page="pageNum" :limit="limit" :data="employeeStore" @next="nextPage" @prew="prewPage" @goPage="goPage" />
  <!-- /Pagination-->

  <!-- Modal -->
  <Teleport to="body">
    <InvoiceModal :show="showModal" @close="closeModal">
      <template #header>
        <p>Маҳсулотга бириктириш</p>
        <p class="text-red-500 text-base">{{ alert }}</p>
      </template>
      <!-- Edite Modal -->
      <template #body>
        <BaseForm>
          <div class="flex flex-col gap-4 items-end">
            <div v-for="(item, index) in form.inventories" class="flex w-full  items-baseline gap-4">
              <div class=" flex gap-4 items-baseline">
                <BaseButton @click.prevent="openCamera(index)" color="green">
                  <EyeIcon class="relative h-5 w-5" />
                </BaseButton>
                <BaseButton @click.prevent="removeInvoice(index, form.inventories.length)" color="red">
                  <TrashIcon class="relative h-5 w-5 text-red-600" />
                </BaseButton>
                <BaseButton v-if="index === form.inventories.length - 1 && form.inventories[index]._id"
                  @click.prevent="addInvoice(index)" color="blue">
                  <PlusIcon class="relative h-5 w-5" />
                </BaseButton>
                <p class="text-xl">{{ item.product }}</p>
              </div>
            </div>
            <div class="w-full">
              <p v-if="errorEl" class="text-red-600">{{ errorEl }}</p>
            </div>
          </div>
        </BaseForm>
      </template>
      <!-- /Edite Modal -->
      <template #button>
        <BaseButton class="w-32" @click="submitForm" color="green">Сақлаш</BaseButton>
      </template>
    </InvoiceModal>
    <!-- /Invoice Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Ходим: {{ qrCodeStore.qrCodes[0]?.employee?.full_name }}</template>
      <template #body>
        <div v-if="!qrCodeStore.qrCodes.length" class="text-main  rounded-2xl bg-white py-2 text-center min-h-96">
          Бу ходимга маҳсулот бириктирилмаган!
        </div>
        <div v-else class=" overflow-auto rounded-2xl bg-white py-2 min-h-96">
          <qrCodeTable :columns="columnsInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="limit"
            :count="qrCodeStore.count" :summa="qrCodeStore.summa" @download="downloadFile" @showQr="showFile"
            @reload="reload" />
        </div>
      </template>
      <template #footer>
        <!-- Pagination -->
        <Pagination :page="pageInfo" :limit="limit" :data="qrCodeStore" @next="nextPage('info')"
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

    <!-- cameraModal -->
    <BaseModal :show="isCameraActive" @close="closeCamera" class="w-1/2">
      <template #header>Қр Код: {{ qrCode }} </template>
      <template #body>
        <div class="w-96 h-96 relative left-1/2 transform -translate-x-1/2">
          <BaseButton @click.prevent="switchCamera" color="blue" class="absolute top-0 right-0 z-20">
            <ArrowPathIcon class="w-10 h-10" />
          </BaseButton>
          <qrcode-stream :constraints="selectedConstraints" @detect="onDetect" @error="onError" class="rounded-2xl" />
        </div>
      </template>
    </BaseModal>
    <!-- /cameraModal -->
  </Teleport>
  <!-- /Modal -->
</template>
