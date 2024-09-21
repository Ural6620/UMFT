<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useEmployeeStore } from "@/stores/employee";
import { useRoomStore } from "@/stores/room";
import { useProductStore } from "@/stores/product";
import { useQrCodeStore } from "@/stores/qrCode";;
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/vue/24/solid";
import api from "@/plugins/axios";
import EmployeeTable from "@/components/table/EmployeeTable.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import SelectQrCode from "@/components/form/selectQrCode.vue";
import InvoiceModal from "@/components/ui/InvoiceModal.vue";
import SelectDepartment from "@/components/form/SelectDepartment.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue";

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
const empoyeeId = ref('')
const pageNum = ref(1);
const limit = 12;
const titleEmployee = ref('');
const codeDepartment = ref('');
const qrCode = ref('');
const urlQrCode = ref('');

const columns = [
  { name: "№" },
  { name: "Тўлиқ Исми" },
  { name: "Кафедраси" },
  { name: "Академик даражаси" },
  { name: "Лавозими" },
  { name: "" },
];

const columnsInfo = [
  { name: "№" },
  { name: "Маҳсулот" },
  { name: "Модел" },
  { name: "Фактура" },
  { name: "Хона" },
  { name: "Ходим" },
  { name: "Нарҳ" },
  { name: "" },
];

const form = reactive({
  employee: "",
  inventories: [
    {
      room: "",
      product: "",
      _id: ""
    }
  ]
})

function addInvoice() {
  form.inventories.push({
    room: "",
    product: "",
    _id: ""
  })
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
      room: "",
      product: "",
      _id: ""
    }
  ]
}

async function synchronAll() {
  await employeeStore.patch()
}

async function synchron(product, room) {
  await qrCodeStore.getAll(0, 0, product, room, "empty")
}

function submitForm() {
  employeeStore.editeEmployee(form);
  closeModal();
}

async function goPage(n, item) {
  if (item === 'info') {
    pageInfo.value = n;
    await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', empoyeeId.value);
  } else {
    pageNum.value = n;
    router.push({ name: "employee", query: { page: pageNum.value, employee: titleEmployee.value } });
    await employeeStore.get(limit, pageNum.value, titleEmployee.value, codeDepartment.value);
  }
}

async function prewPage(item) {
  if (item === 'info') {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', empoyeeId.value);
  } else {
    if (pageNum.value > 1) {
      pageNum.value--;
    }
    await goPage(pageNum.value);
  }
}

async function nextPage(item) {
  if (item === 'info') {
    if (pageInfo.value < Math.ceil(qrCodeStore.count / 12)) {
      pageInfo.value++;
    }
    await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', empoyeeId.value);
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function searchFullName() {
  pageNum.value = 1;
  router.push({ name: "employee", query: { page: pageNum.value, employee: titleEmployee.value } });
  await employeeStore.get(limit, pageNum.value, titleEmployee.value, codeDepartment.value);
}

async function filterDepartment() {
  pageNum.value = 1;
  router.push({ name: "employee", query: { page: pageNum.value, code: codeDepartment.value } });
  await employeeStore.get(limit, pageNum.value, titleEmployee.value, codeDepartment.value);
}

async function openInfo(id) {
  isInfo.value = true;
  empoyeeId.value = id;
  // await employeeStore.getEmployeeById(id);
  await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', empoyeeId.value);
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
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = item.split('/').pop();
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
  showQr.value = false;
  qrCode.value = '';
  urlQrCode.value = '';
  isInfo.value = true;
}

function closeInfo() {
  pageInfo.value = 1;
  isInfo.value = false;
}

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    const queryPage = route.query.page || 1;
    const queryTitle = route.query.employee;
    const queryCode = route.query.code;
    pageNum.value = queryPage;
    titleEmployee.value = queryTitle;
    codeDepartment.value = queryCode;
    await employeeStore.get(limit, pageNum.value, titleEmployee.value, codeDepartment.value);
    await employeeStore.getDepartment();

  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
})

</script>
<template>
  <div class="flex flex-col gap-4">
    <!-- Header Product -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl text-[#1814F3] font-semibold">Ходим</h3>
      <div class="flex gap-4 items-center">

        <!-- Filter Department -->
        <SelectDepartment placeholder="Кафедрани танланг" :data="employeeStore.departments" v-model="codeDepartment"
          @update:model-value="filterDepartment" />
        <!-- /Filter Department -->

        <!-- Filter title -->
        <input type="text"
          class="w-20  lg:w-40 px-4 py-1.5 border rounded-md text-[#1814F3] focus:outline-none focus:border-[#1814F3] placeholder:text-[#8BA3CB]"
          placeholder="ФИО" v-model="titleEmployee" @input="searchFullName">
        <!-- /Filter title -->

        <button @click.prevent="synchronAll()"
          class="p-2 transition ease-linear bg-yellow-100 hover:bg-yellow-300 rounded justify-center items-center gap-1 inline-flex">
          <ArrowPathIcon class="text-yellow-600 w-3.5 h-3.5" />
        </button>

      </div>
    </div>
    <!-- /Header Product -->

    <!-- <pre>{{ employeeStore.departments }}</pre> -->

    <!-- Table -->
    <div class="lg:h-[660px] overflow-auto bg-white rounded-2xl py-2">
      <EmployeeTable :columns="columns" :data="employeeStore.employees" :page="pageNum" :limit="limit"
        @edite="openModal" @main="openInfo" />
    </div>
    <!-- /Table -->

    <!-- Pagination -->
    <div class="w-full flex items-center justify-end px-10 gap-2 text-[#1814F3]">
      <span class="flex items-center cursor-pointer" @click="prewPage">
        <ChevronLeftIcon class="w-4 h-4" />
      </span>
      <span v-if="pageNum > 2" class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        :class="1 === pageNum ? 'text-white bg-[#1814F3]' : ''" @click="goPage(1)">
        {{ 1 }}
      </span>
      <span v-if="pageNum > 2">...</span>
      <span v-if="pageNum > 1" class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        @click="goPage(pageNum - 1)">
        {{ pageNum - 1 }}
      </span>
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md text-white bg-[#1814F3]">
        {{ pageNum }}
      </span>
      <span v-if="pageNum < Math.ceil(employeeStore.count / limit) - 1"
        class="cursor-pointer transition-all ease-linear px-2 rounded-md" @click="goPage(pageNum + 1)">
        {{ Number(pageNum) + 1 }}
      </span>
      <span v-if="pageNum < Math.ceil(employeeStore.count / limit) - 1">...</span>
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        v-if="Math.ceil(employeeStore.count / limit) > pageNum"
        :class="Math.ceil(employeeStore.count / limit) === pageNum ? 'text-white bg-[#1814F3]' : ''"
        @click="goPage(Math.ceil(employeeStore.count / limit))">
        {{ Math.ceil(employeeStore.count / limit) }}
      </span>
      <span class="flex gap-1 items-center cursor-pointer" @click="nextPage">
        <ChevronRightIcon class="w-4 h-4" />
      </span>
    </div>
    <!-- /Pagination-->

    <!-- Modal -->
    <Teleport to="body">
      <!-- /Invoice Modal -->
      <InvoiceModal :show="showModal" @close="closeModal">
        <template #header>Маҳсулотга бириктириш</template>
        <!-- Edite Modal -->
        <template #body>
          <BaseForm>
            <div class="flex flex-col items-end col-span-4 max-h-96">
              <div class="grid grid-cols-11 gap-4 w-full font-semibold text-[#718EBF]">
                <h4 class="col-span-3">Маҳсулот</h4>
                <h4 class="col-span-3">Хона</h4>
                <h4 class="col-span-1">Синхрон</h4>
                <h4 class="col-span-3">Қр Код</h4>
              </div>
              <div v-for="item in form.inventories" class="w-full grid grid-cols-11 gap-4 items-center">
                <SelectFilial placeholder="Маҳсулотни танланг" :data="productStore.products" class="col-span-3"
                  v-model="item.product" />
                <SelectFilial placeholder="Хонани танланг" :data="roomStore.rooms" class="col-span-3"
                  v-model="item.room" />
                <div class="col-span-1 mb-2 flex items-center ">
                  <button @click.prevent="synchron(item.product, item.room)"
                    class="p-2 transition ease-linear bg-yellow-100 hover:bg-yellow-300 rounded justify-center items-center gap-1 inline-flex">
                    <ArrowPathIcon class="text-yellow-600 w-3.5 h-3.5 relative" />
                  </button>
                </div>
                <SelectQrCode placeholder="Қр Кодни танланг" :data="qrCodeStore.qrCodes" class="col-span-3"
                  v-model="item._id" />
                <div class="col-span-1 mb-2 flex items-center ">
                  <button @click.prevent="removeInvoice(item)"
                    class="p-2 transition ease-linear bg-red-100 hover:bg-red-300 rounded justify-center items-center gap-1 inline-flex">
                    <TrashIcon class="text-red-600 w-3.5 h-3.5 relative" />
                  </button>
                </div>
              </div>
              <button @click.prevent="addInvoice()"
                class="w-20 flex justify-center items-center pb-1  transition ease-linear bg-blue-100 hover:bg-blue-300 rounded">
                <span class="text-blue-600 text-2xl relative"> + </span>
              </button>
            </div>
          </BaseForm>
        </template>
        <!-- /Edite Modal -->
        <template #button>
          <button @click="submitForm"
            class="w-32 bg-blue-100 text-blue-600 hover:bg-blue-300 transition-all ease-linear rounded-md py-1">
            Сақлаш
          </button>
        </template>
      </InvoiceModal>
      <!-- /Invoice Modal -->

      <!-- Info Modal -->
      <InfoRoomModal :show="isInfo" @close="closeInfo">
        <template #header>Ходим: {{ qrCodeStore.qrCodes[0]?.employee?.full_name }}</template>
        <template #body>
          <div v-if="!qrCodeStore.qrCodes.length"
            class="h-[660px] bg-white rounded-2xl py-2 text-center text-[#1814F3]">
            Бу ходима маҳсулот бириктирилмаган!
          </div>
          <div v-else class="h-[640px] bg-white rounded-2xl py-2">
            <qrCodeTable :columns="columnsInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="12"
              :count="qrCodeStore.count" :summa="qrCodeStore.summa" @download="downloadFile" @showQr="showFile" />
          </div>
        </template>
        <template #footer>
          <!-- Pagination -->
          <div class="w-full flex items-center justify-end px-10 gap-2 text-[#1814F3]">
            <span class="flex items-center cursor-pointer" @click="prewPage('info')">
              <ChevronLeftIcon class="w-4 h-4" />
            </span>
            <span v-if="pageInfo > 2" class="cursor-pointer transition-all ease-linear px-2 rounded-md"
              :class="1 === pageInfo ? 'text-white bg-[#1814F3]' : ''" @click="goPage(1, 'info')">
              {{ 1 }}
            </span>
            <span v-if="pageInfo > 2">...</span>
            <span v-if="pageInfo > 1" class="cursor-pointer transition-all ease-linear px-2 rounded-md"
              @click="goPage(pageInfo - 1, 'info')">
              {{ pageInfo - 1 }}
            </span>
            <span class="cursor-pointer transition-all ease-linear px-2 rounded-md text-white bg-[#1814F3]"
              @click="goPage(pageInfo, 'info')">
              {{ pageInfo }}
            </span>
            <span v-if="pageInfo < Math.ceil(qrCodeStore.count / 12) - 1"
              class="cursor-pointer transition-all ease-linear px-2 rounded-md" @click="goPage(pageInfo + 1, 'info')">
              {{ Number(pageInfo) + 1 }}
            </span>
            <span v-if="pageInfo < Math.ceil(qrCodeStore.count / 12) - 1">...</span>
            <span class="cursor-pointer transition-all ease-linear px-2 rounded-md"
              v-if="Math.ceil(qrCodeStore.count / 12) > pageInfo"
              :class="Math.ceil(qrCodeStore.count / 12) === pageInfo ? 'text-white bg-[#1814F3]' : ''"
              @click="goPage(Math.ceil(qrCodeStore.count / 12), 'info')">
              {{ Math.ceil(qrCodeStore.count / 12) }}
            </span>
            <span class="flex gap-1 items-center cursor-pointer" @click="nextPage('info')">
              <ChevronRightIcon class="w-4 h-4" />
            </span>
          </div>
          <!-- /Pagination-->
        </template>
      </InfoRoomModal>
      <!-- /Info Modal -->

      <!-- showModal -->
      <BaseModal :show="showQr" @close="closeFileModal">
        <template #header>Қр Код: {{ qrCode }} </template>
        <template #body>
          <div class="flex justify-center items-center p-20">
            <img class="w-64 h-64" :src="urlQrCode" alt="Qr Code">
          </div>
        </template>
      </BaseModal>
      <!-- /showModal -->
    </Teleport>
    <!-- /Modal -->
  </div>
</template>