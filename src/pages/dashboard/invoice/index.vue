<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useInvoiceStore } from "@/stores/invoice";
import { useProductStore } from "@/stores/product";
import { useRoomStore } from "@/stores/room";
import { useQrCodeStore } from "@/stores/qrCode";
import { useRoute, useRouter } from "vue-router";
import { TrashIcon, ArchiveBoxXMarkIcon, ArchiveBoxArrowDownIcon, ArrowDownOnSquareIcon, PlusIcon } from "@heroicons/vue/24/solid";
import BaseButton from "@/components/ui/BaseButton.vue";
import InvoiceModal from "@/components/ui/InvoiceModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import InvoiceTable from "@/components/table/InvoiceTable.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import FileModal from "@/components/ui/FileModal.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import api from "@/plugins/axios";
import Pagination from "@/components/ui/Pagination.vue";
import { colInvoice } from "@/components/constants/constants";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const invoiceStore = useInvoiceStore();
const productStore = useProductStore();
const roomStore = useRoomStore();
const qrCodeStore = useQrCodeStore();
const showModal = ref(false);
const isDelete = ref(false);
const isFile = ref(false);
const showQr = ref(false);
const isInfo = ref(false);
const pageInfo = ref(1);
const invoiceId = ref("");
const limit = 8;
const pageNum = ref(1);
const titleInvoice = ref("");
const qrCode = ref("");
const urlQrCode = ref("");

const form = reactive({
  title: "",
  description: "",
  file: [],
  invoicepack: [
    {
      product: "",
      count: 0,
      per_price: 0,
      total_price: 0,
    },
  ],
});

const formEdite = ref([
  {
    product: "",
    room: "",
    count: 0,
  },
]);

async function handleFile(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  let uploadFile = await invoiceStore.uploadInvoice(formData);
  form.file.push(uploadFile.data);
}

const handleDelete = async () => {
  pageNum.value = 1;
  await invoiceStore.deleteInvoice(invoiceStore.invoiceById?._id);
  await invoiceStore.get(limit, pageNum.value, titleInvoice.value);
  isDelete.value = false;
};

const handleEdite = async (id) => {
  await invoiceStore.getInvoiceById(id);
  await roomStore.get(0);
  await productStore.get(0);
  form._id = invoiceStore.invoiceById._id;
  form.title = invoiceStore.invoiceById.title;
  form.description = invoiceStore.invoiceById.description;
  form.file = invoiceStore.invoiceById.file;
  form.invoicepack = invoiceStore.invoiceById.invoicepack;
  showModal.value = true;
};

async function openFileModal(id) {
  await invoiceStore.getInvoiceById(id);
  form.file = invoiceStore.invoiceById.file;
  isFile.value = true;
}

function closeInvoiceFileModal() {
  form.file = [];
  isFile.value = false;
}

async function downloadInvoiceFile(item) {
  try {
    const fileUrl = `http://195.158.9.124:4101/${item}`;
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

async function submitForm() {
  if (!form._id) {
    await invoiceStore.addInvoice(form);
  } else {
    await invoiceStore.updateInvoice(formEdite.value);
  }
  showModal.value = false;
  await invoiceStore.get(limit, pageNum.value, titleInvoice.value);
  resetForm();
}

function openDelete(id) {
  invoiceStore.getInvoiceById(id);
  isDelete.value = true;
}

function resetForm() {
  delete form?._id;
  form.title = "";
  form.description = "";
  form.file = [];
  form.invoicepack = [
    {
      product: "",
      count: 0,
      per_price: 0,
      total_price: 0,
    },
  ];
  formEdite.value = [
    {
      product: "",
      room: "",
      count: 0,
    },
  ];
}

async function openModal() {
  productStore.get(0);
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

function addInvoice(item) {
  if (item === "form") {
    form.invoicepack.push({
      product: "",
      count: 0,
      per_price: 0,
      total_price: 0,
    });
  } else {
    formEdite.value.push({
      product: "",
      room: "",
      count: 0,
    });
  }
}

function deleteInvoice(invoice) {
  let index = form.invoicepack.findIndex(
    (item) => item.product === invoice.product,
  );
  if (index !== -1) {
    form.invoicepack.splice(index, 1);
  }
}

function deleteInvoiceEdite(invoice) {
  let index = formEdite.value.findIndex(
    (item) => item.product === invoice.product,
  );
  if (index !== -1) {
    formEdite.value.splice(index, 1);
  }
}

function deleteFile(index) {
  form.file.splice(index, 1);
}

function invoiceSum(invoice) {
  const sum = invoice.count * invoice.per_price;
  invoice.total_price = sum;
  return sum;
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(12, pageInfo.value, "", "", "", invoiceId.value);
  } else {
    pageNum.value = n;
    router.push({
      name: "invoice",
      query: { page: pageNum.value, invoice: titleInvoice.value },
    });
    invoiceStore.get(limit, pageNum.value, titleInvoice.value);
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(12, pageInfo.value, "", "", "", invoiceId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, "", "", "", invoiceId.value);
  } else {
    const maxPage = Math.ceil(invoiceStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

function filter() {
  pageNum.value = 1;
  router.push({
    name: "invoice",
    query: { page: 1, invoice: titleInvoice.value },
  });
  invoiceStore.get(limit, pageNum.value, titleInvoice.value);
}

function clear() {
  titleInvoice.value = "";
  pageNum.value = 1;
  router.push({
    name: "invoice",
    query: { page: 1, invoice: titleInvoice.value },
  });
  invoiceStore.get(limit, pageNum.value, titleInvoice.value);
}

async function openInfo(id) {
  isInfo.value = true;
  invoiceId.value = id;
  await invoiceStore.getInvoiceById(id);
  await qrCodeStore.getAll(12, pageInfo.value, "", "", "", invoiceId.value);
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

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    const queryPage = Number(route.query.page) || 1;
    const queryInvoice = route.query.invoice || "";

    pageNum.value = Number(queryPage);
    titleInvoice.value = queryInvoice;
    await invoiceStore.get(limit, pageNum.value, titleInvoice.value);
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});
</script>

<template>
  <!-- Header Product -->
  <div class="flex items-center justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Счёт фактура</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="number"
        class="text-main focus:border-main w-44 truncate rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Фактура рақами" v-model="titleInvoice" />
      <!-- /Filter title -->

      <BaseButton @click="filter" color="blue">
        <ArchiveBoxArrowDownIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="red">
        <ArchiveBoxXMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="showModal = true" color="green">
        <PlusIcon class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>
  <!-- /Header Product -->

  <!-- Table -->
  <div class="flex-1 overflow-auto rounded-2xl bg-white py-2">
    <InvoiceTable :columns="colInvoice" :data="invoiceStore.invoices" @edite="handleEdite" @delete="openDelete"
      @download="openFileModal" :page="pageNum" :limit="limit" @main="openInfo" />
  </div>
  <!-- /Table -->

  <!-- Pagination -->
  <Pagination :page="pageNum" :limit="limit" :data="invoiceStore" @next="nextPage" @prew="prewPage" @goPage="goPage" />
  <!-- /Pagination-->

  <!-- Modal -->
  <Teleport to="body">
    <!-- /Invoice Modal -->
    <InvoiceModal :show="showModal" @close="closeModal">
      <template #header>
        Счёт фактура{{ form._id ? "ни узгартириш" : " Яратиш" }}
      </template>
      <!-- Edite Modal -->
      <template v-if="form._id" #body>
        <BaseForm @submit.prevent="submitForm">
          <div class="col-span-4 flex max-h-96 flex-col items-end">
            <div class="grid w-full grid-cols-10 gap-4 font-semibold text-[#718EBF]">
              <h4 class="col-span-3">Маҳсулот</h4>
              <h4 class="col-span-3">Хона</h4>
              <h4 class="col-span-3">Сони</h4>
            </div>
            <div v-for="item in formEdite" class="grid w-full grid-cols-10 gap-4 items-baseline">
              <SelectFilial placeholder="Маҳсулотни танланг" :data="productStore.products" class="col-span-3"
                v-model="item.product" />
              <SelectFilial placeholder="Хонани танланг" :data="roomStore.rooms" class="col-span-3"
                v-model="item.room" />
              <BaseInput placeholder="Сони" inputType="number" class="col-span-3" v-model="item.count" />
              <div class="col-span-1 mb-2 flex items-center">
                <button @click.prevent="deleteInvoiceEdite(item)"
                  class="inline-flex items-center justify-center gap-1 rounded bg-red-100 p-2 transition ease-linear hover:bg-red-300">
                  <TrashIcon class="relative h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            </div>
            <button @click.prevent="addInvoice('formEdite')"
              class="flex w-20 items-center justify-center rounded bg-blue-100 pb-1 transition ease-linear hover:bg-blue-300">
              <span class="relative text-2xl text-blue-600">+</span>
            </button>
          </div>
        </BaseForm>
      </template>
      <!-- /Edite Modal -->

      <!-- Add Modal -->
      <template v-else #body>
        <BaseForm class="grid grid-cols-4" @submit.prevent="submitForm">
          <div class="col-span-4 grid grid-cols-2 items-center gap-x-4">
            <BaseInput v-model="form.title" label="Фактура рақами" placeholder="Фактура рақами" inputType="number" />
            <BaseInput v-model="form.description" label="Тавсиф" placeholder="Тавсиф" inputType="string" />
            <BaseInput v-model="form.model" label="Модел" placeholder="Модел" inputType="string" />
            <BaseInput label="Файл" placeholder="Файл" inputType="file" @change="handleFile" />
          </div>
          <h6 v-if="form.file.length > 0" class="col-span-4 mb-2 text-xl font-semibold text-[#718EBF]">
            Файллар
          </h6>
          <ol v-if="form.file.length > 0" class="col-span-4 flex flex-col gap-1 rounded border p-2">
            <li class="col-span-4 flex items-center gap-4 pl-2" v-for="item in form.file">
              <p class="text-[#718EBF]">{{ item }}</p>
              <button @click.prevent="deleteFile(item)"
                class="inline-flex items-center justify-center gap-1 rounded bg-red-100 p-2 transition ease-linear hover:bg-red-300">
                <TrashIcon class="relative h-3.5 w-3.5 text-red-600" />
              </button>
            </li>
          </ol>
          <h6 class="col-span-4 mb-4 text-xl font-semibold text-[#718EBF]">
            Счёт фактура қўшиш
          </h6>
          <div class="col-span-4 flex max-h-96 flex-col items-end overflow-y-auto pb-20">
            <div class="grid w-full grid-cols-9 gap-4 font-semibold text-[#718EBF]">
              <h4 class="col-span-2">Маҳсулот</h4>
              <h4 class="col-span-2">Сони</h4>
              <h4 class="col-span-2">Нарҳи</h4>
              <h4 class="col-span-2">Жами</h4>
            </div>
            <div v-for="invoice in form.invoicepack" :data="invoice"
              class="grid w-full grid-cols-9 items-baseline gap-4">
              <SelectFilial placeholder="Маҳсулотни танланг" :data="productStore.products" v-model="invoice.product"
                class="col-span-2" classes="w-full" />
              <BaseInput placeholder="Сони" inputType="number" v-model="invoice.count" class="col-span-2" />
              <BaseInput placeholder="Нарҳи" inputType="number" v-model="invoice.per_price" class="col-span-2" />
              <span
                class="text-main col-span-2 mb-2 flex w-full items-center rounded-md border border-[#8BA3CB] px-2 py-1.5">
                {{ invoiceSum(invoice) }}
              </span>
              <div class="col-span-1 mb-2 flex items-center">
                <button @click.prevent="deleteInvoice(invoice)"
                  class="inline-flex items-center justify-center gap-1 rounded bg-red-100 p-2 transition ease-linear hover:bg-red-300">
                  <TrashIcon class="relative h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            </div>
            <button @click.prevent="addInvoice('form')"
              class="flex w-20 items-center justify-center rounded bg-blue-100 pb-1 transition ease-linear hover:bg-blue-300">
              <span class="relative text-2xl text-blue-600"> +</span>
            </button>
          </div>
        </BaseForm>
      </template>
      <!-- /Add Modal -->
      <template #button>
        <button @click="submitForm"
          class="w-32 rounded-md bg-blue-100 py-1 text-blue-600 transition-all ease-linear hover:bg-blue-300">
          Сақлаш
        </button>
      </template>
    </InvoiceModal>
    <!-- /Invoice Modal -->

    <!-- File Modal -->
    <FileModal :show="isFile" @close="closeInvoiceFileModal">
      <p v-if="form.file.length === 0" class="text-[#718EBF]">
        Файл бириктирилмаган
      </p>
      <ul v-else>
        <li class="flex items-center gap-4" v-for="item in form.file" :data="item">
          <p class="text-[#718EBF]">{{ item }}</p>
          <button @click.prevent="downloadInvoiceFile(item)"
            class="inline-flex items-center justify-center gap-1 rounded bg-yellow-100 p-2 transition ease-linear hover:bg-yellow-300">
            <ArrowDownOnSquareIcon class="h-3.5 w-3.5 text-yellow-600" />
          </button>
        </li>
      </ul>
    </FileModal>
    <!-- /File Modal -->

    <!-- Delete Modal -->
    <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
      <div class="flex justify-center">
        <p class="text-gray-500">
          Сиз
          <span class="capitalize text-red-400">{{
            invoiceStore.invoiceById?.title
          }}</span>
          рақамли фактурани ўчирмоқдасиз!
        </p>
      </div>
    </DeleteModal>
    <!-- /Delete Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Счёт фактура: {{ invoiceStore.invoiceById?.title }}</template>
      <template #body>
        <div v-if="!qrCodeStore.qrCodes.length"
          class="text-main overflow-auto rounded-2xl bg-white py-2 text-center lg:h-[660px]">
          Бу хонага маҳсулот бириктирилмаган
        </div>
        <div v-else class="overflow-auto rounded-2xl bg-white py-2 lg:h-[640px]">
          <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="12"
            @download="downloadFile" @showQr="showFile" :count="qrCodeStore.count" :summa="qrCodeStore.summa" />
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
  </Teleport>
  <!-- /Modal -->
</template>
