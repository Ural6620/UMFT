<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Bars3Icon, PlusIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useCategoryStore } from "@/stores/category";
import { useQrCodeStore } from "@/stores/qrCode";
import { colProduct, colInfo } from "@/components/constants/constants";
import api from "@/plugins/axios";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import ProductTable from "@/components/table/ProductTable.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import Pagination from "@/components/ui/Pagination.vue";

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const productStore = useProductStore();
const qrCodeStore = useQrCodeStore();
const showModal = ref(false);
const isDelete = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const pageNum = ref(1);
const pageInfo = ref(1);
const productId = ref("");
const titleProduct = ref("");
const qrCode = ref("");
const urlQrCode = ref("");
const limit = 14;
const limitQrCode = 14;
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);
const alert = ref('');
const isDeleteEmployee = ref(false);

const form = reactive({
  img: "",
  title: "",
  categoryinventor: "",
  model: "",
  text: "",
});

const formEmployee = reactive({
  _id: '',
  employee: null,
  room: '',
  price: 0,
  invoice: '',
  product: ''
});

async function handleImage(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  let image = await productStore.uploadProduct(formData);
  form.img = image.data;
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
  console.log(form)
  showModal.value = true;
};

async function submitForm() {
  if (!form.img) {
    alert.value = 'Расм юкланг'
  } else if (!form.categoryinventor) {
    alert.value = 'Тоифани танланг'
  } else if (!form.title) {
    alert.value = 'Маҳсулот номини киритинг'
  } else if (!form.model) {
    alert.value = 'Маҳсулот моделини киритинг'
  } else if (!form.text) {
    alert.value = 'Маҳсулот хақида маълумотни киритинг'
  } else {
    if (!form._id) {
      await productStore.addProduct(form);
    } else {
      await productStore.updateProduct(form);
    }
    await productStore.get(limit, pageNum.value, titleProduct.value);
    showModal.value = false;
    resetForm();
  }
}

function openDelete(id) {
  productStore.getProductById(id);
  isDelete.value = true;
}

function resetForm() {
  delete form?._id;
  form.img = "";
  form.title = "";
  form.categoryinventor = "";
  form.model = "";
  form.text = "";
  alert.value = "";
}

async function openModal() {
  await categoryStore.get(0);
  showModal.value = true;
  isMobile.value = false;
}

function closeModal() {
  showModal.value = false;
  resetForm();
}
async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, productId.value, "");
  } else {
    pageNum.value = n;
    router.push({
      name: "product",
      query: { page: pageNum.value, product: titleProduct.value },
    });
    await productStore.get(limit, pageNum.value, titleProduct.value);
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, productId.value, "");
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
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, productId.value, "");
  } else {
    const maxPage = Math.ceil(productStore.count / limit);
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
    name: "product",
    query: { page: pageNum.value, product: titleProduct.value },
  });
  await productStore.get(limit, pageNum.value, titleProduct.value);
}

function clear() {
  titleProduct.value = "";
  pageNum.value = 1;
  router.push({
    name: "product",
    query: { page: pageNum.value, product: titleProduct.value },
  });
  productStore.get(limit, pageNum.value, titleProduct.value);
}

async function openInfo(id) {
  isInfo.value = true;
  productId.value = id;
  await productStore.getProductById(id);
  await qrCodeStore.getAll(limitQrCode, pageInfo.value, productId.value, "");
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
  qrCodeStore.getAll(limitQrCode, pageInfo.value, productId.value, "");
  isInfo.value = true;
}

function closeEmployee() {
  isDeleteEmployee.value = false;
  isInfo.value = true;
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  const queryPage = route.query.page || 1;
  const queryProduct = route.query.product || "";
  pageNum.value = Number(queryPage);
  titleProduct.value = queryProduct;
  await productStore.get(limit, pageNum.value, titleProduct.value);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
<template>
  <!-- Header Product -->
  <div v-if="isLargeScreen" class="flex items-center justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Маҳсулот</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-56 rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Маҳсулот номи" v-model="titleProduct" />
      <!-- /Filter title -->
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
    <h3 class="text-main text-xl font-semibold">Маҳсулот</h3>
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
          class="text-main focus:border-main w-full text-xl rounded-md border px-3 py-2 placeholder:text-[#8BA3CB] focus:outline-none"
          placeholder="Маҳсулот номи" v-model="titleProduct" />
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
  <div class="flex-1 overflow-auto rounded-2xl bg-white py-2">
    <ProductTable :columns="colProduct" :data="productStore?.products" @edite="handleEdite" @delete="openDelete"
      :page="pageNum" :limit="limit" @main="openInfo" />
  </div>
  <!-- /Table -->

  <!-- Pagination -->
  <Pagination :page="pageNum" :limit="limit" :data="productStore" @next="nextPage" @prew="prewPage" @goPage="goPage" />
  <!-- /Pagination-->

  <!-- Modal -->
  <Teleport to="body">
    <!-- Add and Edite Modal -->
    <BaseModal :show="showModal" @close="closeModal">
      <template #header>
        <p> Маҳсулот{{ form._id ? "ни ўзгартириш" : " Яратиш" }}</p>
        <p class="text-red-500 text-base">{{ alert }}</p>
      </template>
      <template #body>
        <BaseForm class="grid grid-cols-2 gap-2">
          <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
            classes="py-[4px] lg:py-1.5" @change="handleImage" />
          <SelectFilial label="Тоифа" :placeholder="categoryStore.categoryById?.title || 'Тоифани танлаш'
            " :data="categoryStore.categories" v-model="form.categoryinventor" />
          <BaseInput v-model="form.title" label="Маҳсулот номи" placeholder="Маҳсулот номи" inputType="string" />
          <BaseInput v-model="form.model" label="Маҳсулот модели" placeholder="Маҳсулот модели" inputType="string" />
          <BaseInput v-model="form.text" label="Маълумот" placeholder="Маълумот" inputType="string" />
        </BaseForm>
      </template>
      <template #button>
        <BaseButton class="w-32" @click="submitForm" color="green">Сақлаш</BaseButton>
      </template>
    </BaseModal>
    <!-- /Add and Edite Modal -->

    <!-- Delete Modal -->
    <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
      <div class="flex justify-center">
        <p class="text-gray-500">
          Сиз
          <span class="capitalize text-red-400">{{
            productStore.productById?.title
          }}</span>
          маҳсулотини учирмоқдасиз!
        </p>
      </div>
    </DeleteModal>
    <!-- /Delete Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Маҳсулот: {{ productStore.productById?.title }}</template>
      <template #body>
        <div class="overflow-auto rounded-2xl bg-white py-2 min-h-[560px] lg:min-h-[750px]">
          <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="limitQrCode"
            @download="downloadFile" @showQr="showFile" :count="qrCodeStore.count" :summa="qrCodeStore.summa"
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
    <!-- /showModals -->

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
  <!-- /Modal -->
</template>
