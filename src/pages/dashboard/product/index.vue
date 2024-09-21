<script setup>
import { ref, reactive, onMounted } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from "@/stores/product";
import { useCategoryStore } from "@/stores/category";
import { useQrCodeStore } from "@/stores/qrCode";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import ProductTable from "@/components/table/ProductTable.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import api from "@/plugins/axios";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const qrCodeStore = useQrCodeStore();
const showModal = ref(false);
const isDelete = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const pageNum = ref(1);
const pageInfo = ref(1);
const productId = ref('');
const orderRoom = ref('');
const titleProduct = ref('');
const qrCode = ref('');
const urlQrCode = ref('');
const limit = 8;

const columns = [
  { name: "№" },
  { name: "Расми" },
  { name: "Номи" },
  { name: "Тоифаси" },
  { name: "Модели" },
  { name: "Маълумот" },
  { name: "Статуси" },
  { name: "Коди" },
  { name: "Хона Коди" },
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
  img: "",
  title: "",
  categoryinventor: "",
  model: "",
  text: "",
});

async function handleImage(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  let image = await productStore.uploadProduct(formData);
  form.img = image.data
}

const handleDelete = async () => {
  pageNum.value = 1;
  await productStore.deleteProduct(productStore.productById?._id);
  await productStore.get(limit, pageNum.value, titleProduct.value);
  isDelete.value = false;
};

const handleEdite = async (id) => {
  await productStore.getProductById(id);
  await categoryStore.getCategoryById(id);
  await categoryStore.get(0);
  await productStore.get(limit, pageNum.value, titleProduct.value);
  form.img = productStore.productById.img;
  form._id = productStore.productById._id;
  form.title = productStore.productById.title;
  form.categoryinventor = productStore.productById?.categoryinventor?._id;
  form.model = productStore.productById.model;
  form.text = productStore.productById.text;
  showModal.value = true;
}

async function submitForm() {
  if (!form._id) {
    await productStore.addProduct(form);
  } else {
    await productStore.updateProduct(form);
  }
  await productStore.get(limit, pageNum.value, titleProduct.value);
  showModal.value = false;
  resetForm()
};

function openDelete(id) {
  productStore.getProductById(id)
  isDelete.value = true;
}

function resetForm() {
  delete form?._id;
  form.img = "";
  form.title = "";
  form.categoryinventor = "";
  form.model = "";
  form.text = "";
}

async function openModal() {
  await categoryStore.get(0);
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  resetForm();
}
async function goPage(n, item) {
  if (item === 'info') {
    pageInfo.value = n;
    await qrCodeStore.getAll(12, pageInfo.value, productId.value, '');
  } else {
    pageNum.value = n;
    router.push({ name: "rooms", query: { page: pageNum.value, room: titleRoom.value, filial: filialId.value } });
    await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value, orderRoom.value);
  }
}

async function prewPage(item) {
  if (item === 'info') {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(12, pageInfo.value, productId.value, '');
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
    await qrCodeStore.getAll(12, pageInfo.value, productId.value, '');
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function searchProduct() {
  pageNum.value = 1;
  router.push({ name: 'product', query: { page: pageNum.value, product: titleProduct.value } });
  await productStore.get(limit, pageNum.value, titleProduct.value);
}

async function openInfo(id) {
  isInfo.value = true;
  productId.value = id;
  await productStore.getProductById(id);
  await qrCodeStore.getAll(12, pageInfo.value, productId.value, '');
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
    const queryProduct = route.query.product || '';

    pageNum.value = Number(queryPage);
    titleProduct.value = queryProduct;
    await productStore.get(limit, pageNum.value, titleProduct.value);
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});

</script>
<template>
  <div class="flex flex-col gap-4">
    <!-- Header Product -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl text-[#1814F3] font-semibold">Маҳсулот</h3>
      <div class="flex gap-4 items-center">

        <!-- Filter title -->
        <input type="text"
          class="w-40 px-4 py-1.5 border rounded-md text-[#1814F3] focus:outline-none focus:border-[#1814F3] placeholder:text-[#8BA3CB]"
          placeholder="Маҳсулот номи" v-model="titleProduct" @input="searchProduct">
        <!-- /Filter title -->

        <BaseButton @click="openModal" class="text-green-600">
          Яратиш
        </BaseButton>
      </div>
    </div>
    <!-- /Header Product -->

    <!-- Table -->
    <div class="h-[600px] overflow-auto bg-white rounded-2xl py-2">
      <ProductTable :columns="columns" :data="productStore.products" @edite="handleEdite" @delete="openDelete"
        :page="pageNum" :limit="limit" @main="openInfo" />
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
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md text-white bg-[#1814F3]"
        @click="goPage(pageNum)">
        {{ pageNum }}
      </span>
      <span v-if="pageNum < Math.ceil(productStore.count / limit) - 1"
        class="cursor-pointer transition-all ease-linear px-2 rounded-md" @click="goPage(pageNum + 1)">
        {{ Number(pageNum) + 1 }}
      </span>
      <span v-if="pageNum < Math.ceil(productStore.count / limit) - 1">...</span>
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        v-if="Math.ceil(productStore.count / limit) > pageNum"
        :class="Math.ceil(productStore.count / limit) === pageNum ? 'text-white bg-[#1814F3]' : ''"
        @click="goPage(Math.ceil(productStore.count / limit))">
        {{ Math.ceil(productStore.count / limit) }}
      </span>
      <span class="flex gap-1 items-center cursor-pointer" @click="nextPage">
        <ChevronRightIcon class="w-4 h-4" />
      </span>
    </div>
    <!-- /Pagination-->


    <!-- Modal -->
    <Teleport to="body">
      <!-- Add and Edite Modal -->
      <BaseModal :show="showModal" @close="closeModal">
        <template #header> Маҳсулот{{ form._id ? 'ни ўзгартириш' : ' Яратиш' }}</template>
        <template #body>
          <BaseForm class="grid grid-cols-2 gap-2">
            <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
              @change="handleImage" />
            <SelectFilial label="Тоифа" :placeholder="categoryStore.categoryById?.title || 'Тоифани танлаш'"
              :data="categoryStore.categories" v-model="form.categoryinventor" />
            <BaseInput v-model="form.title" label="Маҳсулот номи" placeholder="Маҳсулот номи" inputType="string" />
            <BaseInput v-model="form.model" label="Маҳсулот модели" placeholder="Маҳсулот модели" inputType="string" />
            <BaseInput v-model="form.text" label="Маълумот" placeholder="Маълумот" inputType="string" />
          </BaseForm>
        </template>
        <template #button>
          <button @click="submitForm"
            class="w-32 bg-blue-100 text-blue-600 hover:bg-blue-300 transition-all ease-linear rounded-md py-1">
            Сақлаш
          </button>
        </template>
      </BaseModal>
      <!-- /Add and Edite Modal -->

      <!-- Delete Modal -->
      <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
        <div class="flex justify-center">
          <p class="text-gray-500"> Сиз <span class="capitalize text-red-400">{{
            productStore.productById?.title }}</span> маҳсулотини учирмоқдасиз!</p>
        </div>
      </DeleteModal>
      <!-- /Delete Modal -->

      <!-- Info Modal -->
      <InfoRoomModal :show="isInfo" @close="closeInfo">
        <template #header>Маҳсулот: {{ productStore.productById?.title }}</template>
        <template #body>
          <div class="lg:h-[660px] overflow-auto bg-white rounded-2xl py-2">
            <qrCodeTable :columns="columnsInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="12"
              @download="downloadFile" @showQr="showFile" :count="qrCodeStore.count" :summa="qrCodeStore.summa" />
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
      <!-- /showModals -->
    </Teleport>
    <!-- /Modal -->
  </div>
</template>
