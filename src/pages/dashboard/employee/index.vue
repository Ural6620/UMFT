<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useEmployeeStore } from "@/stores/employee";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import { useQrCodeStore } from "@/stores/qrCode";
import { ArrowPathIcon, TrashIcon, EyeIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
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
import BaseInput from "@/components/form/BaseInput.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
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
const codeDepartment = ref("");
const qrCode = ref("");
const urlQrCode = ref("");
const placeholder = ref("Кафедрани танланг");
const errorEl = ref('')
const isCameraActive = ref(false)
const selectedConstraints = ref({ facingMode: 'environment' })
const currentIndex = ref(null);
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);

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

function addInvoice() {
  form.inventories.push({
    room: "",
    product: "",
    _id: "",
  });
}

function removeInvoice(index) {
  form.inventories.splice(index, 1);
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
  employeeStore.editeEmployee(form);
  closeModal();
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(
      12,
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
      query: { page: pageNum.value, employee: titleEmployee.value },
    });
    await employeeStore.get(
      limit,
      pageNum.value,
      titleEmployee.value,
      codeDepartment.value,
    );
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(
      12,
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
    if (pageInfo.value < Math.ceil(qrCodeStore.count / 12)) {
      pageInfo.value++;
    }
    await qrCodeStore.getAll(
      12,
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
  router.push({
    name: "employee",
    query: { page: pageNum.value, employee: titleEmployee.value },
  });
  await employeeStore.get(
    limit,
    pageNum.value,
    titleEmployee.value,
    codeDepartment.value,
  );
  isMobile.value = false;
}

async function filterDepartment() {
  pageNum.value = 1;
  router.push({
    name: "employee",
    query: { page: pageNum.value, code: codeDepartment.value },
  });
  await employeeStore.get(
    limit,
    pageNum.value,
    titleEmployee.value,
    codeDepartment.value,
  );
  isMobile.value = false;
}

async function openInfo(id) {
  isInfo.value = true;
  empoyeeId.value = id;
  // await employeeStore.getEmployeeById(id);
  await qrCodeStore.getAll(12, pageInfo.value, "", "", "", "", empoyeeId.value);
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
  codeDepartment.value = "";
  placeholder.value = "Кафедрани танланг";
  pageNum.value = 1;
  router.push({
    name: "employee",
    query: { page: pageNum.value, employee: titleEmployee.value },
  });
  employeeStore.get(limit, pageNum.value, titleEmployee.value, codeDepartment.value);
}

function openCamera(index) {
  currentIndex.value = index; // Hozirgi indexni belgilash
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

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    window.addEventListener('resize', handleResize);
    const queryPage = route.query.page || 1;
    const queryTitle = route.query.employee;
    const queryCode = route.query.code;
    pageNum.value = queryPage;
    titleEmployee.value = queryTitle;
    codeDepartment.value = queryCode;
    await employeeStore.get(
      limit,
      pageNum.value,
      titleEmployee.value,
      codeDepartment.value,
    );
    await employeeStore.getDepartment();
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
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
      <SelectDepartment :placeholder="placeholder" :data="employeeStore.departments" v-model="codeDepartment"
        @update:model-value="filterDepartment" class="w-64" />
      <!-- /Filter Department -->

      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-640 rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none lg:w-40"
        placeholder="ФИО" v-model="titleEmployee" @input="searchFullName" />
      <!-- /Filter title -->

      <BaseButton @click="filter" color="yellow">
        <MagnifyingGlassIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="red">
        <XMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click.prevent="synchronAll()" color="blue">
        <ArrowPathIcon class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>

  <div v-else class="flex justify-between  items-center relative pt-16">
    <h3 class="text-main text-xl font-semibold">Ходим</h3>
    <BaseButton @click="isMobile = true">
      <Bars3Icon class="h-5 w-5" />
    </BaseButton>
    <div v-if="isMobile"
      class="flex flex-col items-center absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <!-- Filter Department -->
      <SelectDepartment :placeholder="placeholder" :data="employeeStore.departments" v-model="codeDepartment"
        @update:model-value="filterDepartment" class="w-full" />
      <!-- /Filter Department -->

      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-full rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none lg:w-40"
        placeholder="ФИО" v-model="titleEmployee" @input="searchFullName" />
      <!-- /Filter title -->

      <BaseButton @click="filter" color="yellow" class="w-1/2">
        <MagnifyingGlassIcon class="h-5 w-5" />
      </BaseButton>
      <BaseButton @click="clear" color="red" class="w-1/2">
        <XMarkIcon class="h-5 w-5" />
      </BaseButton>
      <BaseButton @click.prevent="synchronAll()" color="blue" class="w-1/2">
        <ArrowPathIcon class="h-5 w-5" />
      </BaseButton>
    </div>
  </div>
  <!-- /Header Product -->

  <!-- Table -->
  <div class="overflow-auto rounded-2xl bg-white">
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
      <template #header>Маҳсулотга бириктириш</template>
      <!-- Edite Modal -->
      <template #body>
        <BaseForm>
          <div class="flex flex-col gap-4 items-end">
            <div v-for="(item, index) in form.inventories" class="flex w-full  items-baseline gap-4">
              <div class=" flex gap-4 items-baseline">
                <BaseButton @click.prevent="openCamera(index)" color="blue">
                  <EyeIcon class="relative h-5 w-5" />
                </BaseButton>
                <BaseButton @click.prevent="removeInvoice(item)" color="red">
                  <TrashIcon class="relative h-5 w-5 text-red-600" />
                </BaseButton>
                <p class="text-xl">{{ item.product }}</p>
              </div>
            </div>
            <div class="w-full">
              <p v-if="errorEl" class="text-red-600">{{ errorEl }}</p>
            </div>
            <button @click.prevent="addInvoice()"
              class="flex w-20 items-center justify-center rounded bg-blue-100 pb-1 transition ease-linear hover:bg-blue-300">
              <span class="relative text-2xl text-blue-600"> + </span>
            </button>
          </div>
        </BaseForm>
      </template>
      <!-- /Edite Modal -->
      <template #button>
        <button @click="submitForm"
          class="w-32 rounded-md bg-blue-100 py-1 text-blue-600 transition-all ease-linear hover:bg-blue-300">
          Сақлаш
        </button>
      </template>
    </InvoiceModal>
    <!-- /Invoice Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Ходим: {{ qrCodeStore.qrCodes[0]?.employee?.full_name }}</template>
      <template #body>
        <div v-if="!qrCodeStore.qrCodes.length" class="text-main  rounded-2xl bg-white py-2 text-center">
          Бу ходима маҳсулот бириктирилмаган!
        </div>
        <div v-else class=" overflow-auto rounded-2xl bg-white py-2">
          <qrCodeTable :columns="columnsInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="12"
            :count="qrCodeStore.count" :summa="qrCodeStore.summa" @download="downloadFile" @showQr="showFile" />
        </div>
      </template>
      <template #footer>
        <!-- Pagination -->
        <Pagination :page="pageInfo" :limit="12" :data="qrCodeStore" @next="nextPage('info')" @prew="prewPage('info')"
          @goPage="goPage($event, 'info')" />
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
    <BaseModal :show="isCameraActive" @close="closeCamera">
      <template #header>Қр Код: {{ qrCode }} </template>
      <template #body>
        <div class="w-96 h-96 relative left-1/2 transform -translate-x-1/2">
          <BaseButton @click.prevent="switchCamera" color="red" class="absolute top-0 right-0 z-20">
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
