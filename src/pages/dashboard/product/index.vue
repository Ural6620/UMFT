<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Bars3Icon, PlusIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
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
const productId = ref("");
const titleProduct = ref("");
const qrCode = ref("");
const urlQrCode = ref("");
const limit = 8;
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);

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
  showModal.value = true;
};

async function submitForm() {
  if (!form._id) {
    await productStore.addProduct(form);
  } else {
    await productStore.updateProduct(form);
  }
  await productStore.get(limit, pageNum.value, titleProduct.value);
  showModal.value = false;
  resetForm();
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
    await qrCodeStore.getAll(12, pageInfo.value, productId.value, "");
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
    await qrCodeStore.getAll(12, pageInfo.value, productId.value, "");
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
    await qrCodeStore.getAll(12, pageInfo.value, productId.value, "");
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
  await qrCodeStore.getAll(12, pageInfo.value, productId.value, "");
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

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    window.addEventListener('resize', handleResize);
    const queryPage = route.query.page || 1;
    const queryProduct = route.query.product || "";

    pageNum.value = Number(queryPage);
    titleProduct.value = queryProduct;
    await productStore.get(limit, pageNum.value, titleProduct.value);
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
  <div v-if="isLargeScreen" class="flex items-center justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Маҳсулот</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-40 rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Маҳсулот номи" v-model="titleProduct" />
      <!-- /Filter title -->
      <BaseButton @click="filter" color="yellow">
        <MagnifyingGlassIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="red">
        <XMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="showModal = true" color="blue">
        <PlusIcon class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>
  <div v-else class="flex justify-between  items-center relative pt-16">
    <h3 class="text-main text-xl font-semibold">Маҳсулот</h3>
    <BaseButton @click="isMobile = true">
      <Bars3Icon class="h-5 w-5" />
    </BaseButton>
    <div v-if="isMobile"
      class="flex flex-col items-center absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-1/2 rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Маҳсулот номи" v-model="titleProduct" />

      <BaseButton @click="filter" color="yellow" class="w-1/2">
        <MagnifyingGlassIcon class="h-5 w-5" />
      </BaseButton>
      <BaseButton @click="clear" color="red" class="w-1/2">
        <XMarkIcon class="h-5 w-5" />
      </BaseButton>
      <BaseButton @click="openModal" color="blue" class="w-1/2">
        <PlusIcon class="h-5 w-5" />
      </BaseButton>
    </div>
  </div>
  <!-- /Header Product -->

  <!-- Table -->
  <div class="flex-1 overflow-auto rounded-2xl bg-white py-2">
    <ProductTable :columns="colProduct" :data="productStore.products" @edite="handleEdite" @delete="openDelete"
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
        Маҳсулот{{ form._id ? "ни ўзгартириш" : " Яратиш" }}</template>
      <template #body>
        <BaseForm class="grid grid-cols-2 gap-2">
          <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
            @change="handleImage" />
          <SelectFilial label="Тоифа" :placeholder="categoryStore.categoryById?.title || 'Тоифани танлаш'
            " :data="categoryStore.categories" v-model="form.categoryinventor" />
          <BaseInput v-model="form.title" label="Маҳсулот номи" placeholder="Маҳсулот номи" inputType="string" />
          <BaseInput v-model="form.model" label="Маҳсулот модели" placeholder="Маҳсулот модели" inputType="string" />
          <BaseInput v-model="form.text" label="Маълумот" placeholder="Маълумот" inputType="string" />
        </BaseForm>
      </template>
      <template #button>
        <button @click="submitForm"
          class="w-32 rounded-md bg-blue-100 py-1 text-blue-600 transition-all ease-linear hover:bg-blue-300">
          Сақлаш
        </button>
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
        <div class="overflow-auto rounded-2xl bg-white py-2 lg:h-[660px]">
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
    <!-- /showModals -->
  </Teleport>
  <!-- /Modal -->
</template>
