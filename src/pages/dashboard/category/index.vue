<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useCategoryStore } from "@/stores/category";
import { useQrCodeStore } from "@/stores/qrCode";
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon, Bars3Icon } from "@heroicons/vue/24/solid";
import { useRoute, useRouter } from "vue-router";
import { colCategory, colInfo } from "@/components/constants/constants";
import api from "@/plugins/axios";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import CategoryTable from "@/components/table/CategoryTable.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import Pagination from "@/components/ui/Pagination.vue";

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const qrCodeStore = useQrCodeStore();
const showModal = ref(false);
const isDelete = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const pageNum = ref(1);
const pageInfo = ref(1);
const categoryId = ref("");
const titleCategory = ref("");
const qrCode = ref("");
const urlQrCode = ref("");
const limit = 14;
const limitQrCode = 14;
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);
const alert = ref('')

const form = reactive({
  img: "",
  title: "",
});

async function handleImage(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  let image = await categoryStore.uploadCategory(formData);
  form.img = image.data;
}

const handleDelete = async () => {
  pageNum.value = 1;
  await categoryStore.deleteCategory(categoryStore.categoryById?._id);
  await categoryStore.get(limit, pageNum.value, titleCategory.value);
  isDelete.value = false;
};

const handleEdite = async (id) => {
  await categoryStore.getCategoryById(id);
  form.img = categoryStore.categoryById.img;
  form._id = categoryStore.categoryById._id;
  form.title = categoryStore.categoryById.title;
  form.products = categoryStore.categoryById.products;
  form.codes = categoryStore.categoryById.codes;
  form.status = categoryStore.categoryById.status;
  showModal.value = true;
};

async function submitForm() {
  if (!form.img) {
    alert.value = 'Расм юкланг'
  } else if (!form.title) {
    alert.value = 'Тоифа номини киритинг'
  } else {
    if (!form._id) {
      await categoryStore.addCategory(form);
    } else {
      await categoryStore.updateCategory(form);
    }
    await categoryStore.get(limit, pageNum.value, titleCategory.value);
    showModal.value = false;
    resetForm();
  }
}

function openDelete(id) {
  isDelete.value = true;
  categoryStore.getCategoryById(id);
}

function resetForm() {
  delete form?._id;
  form.img = "";
  form.title = "";
  alert.value = '';
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(
      limitQrCode,
      pageInfo.value,
      "",
      "",
      "",
      "",
      "",
      categoryId.value,
    );
  } else {
    pageNum.value = n;
    await router.push({
      name: "category",
      query: { page: pageNum.value, title: titleCategory.value },
    });
    await categoryStore.get(limit, pageNum.value, titleCategory.value);
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(
      limitQrCode,
      pageInfo.value,
      "",
      "",
      "",
      "",
      "",
      categoryId.value,
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
    if (pageInfo.value < Math.ceil(qrCodeStore.count / limitQrCode)) {
      pageInfo.value++;
    }
    await qrCodeStore.getAll(
      limitQrCode,
      pageInfo.value,
      "",
      "",
      "",
      "",
      "",
      categoryId.value,
    );
  } else {
    const maxPage = Math.ceil(categoryStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function filter() {
  pageNum.value = 1;
  await router.push({
    name: "category",
    query: { page: pageNum.value, title: titleCategory.value },
  });
  await categoryStore.get(limit, pageNum.value, titleCategory.value);
  isMobile.value = false;
}

function openModal() {
  isMobile.value = false;
  showModal.value = true;
}

async function openInfo(id) {
  isInfo.value = true;
  categoryId.value = id;
  await categoryStore.getCategoryById(id);
  await qrCodeStore.getAll(
    limitQrCode,
    pageInfo.value,
    "",
    "",
    "",
    "",
    "",
    categoryId.value,
  );
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
  titleCategory.value = "";
  pageNum.value = 1;
  router.push({
    name: "category",
    query: { page: pageNum.value, title: titleCategory.value },
  });
  categoryStore.get(limit, pageNum.value, titleCategory.value);
}

function handleResize() {
  isLargeScreen.value = window.innerWidth > 760;
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  const queryPage = route.query.page;
  const queryTitle = route.query.title;
  pageNum.value = Number(queryPage) || 1;
  titleCategory.value = queryTitle || "";
  await router.push({
    name: "category",
    query: { page: pageNum.value, title: titleCategory.value },
  });
  await categoryStore.get(limit, pageNum.value, titleCategory.value);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
<template>

  <!-- Header Category -->
  <div v-if="isLargeScreen" class="flex items-center justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Тоифа</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-56 rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Тоифа номи" v-model="titleCategory" />
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
    <h3 class="text-main text-xl font-semibold">Тоифа</h3>
    <BaseButton @click="isMobile = true">
      <Bars3Icon class="h-5 w-5" />
    </BaseButton>
    <div v-if="isMobile"
      class="flex flex-col items-center absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-1/2 rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Тоифа номи" v-model="titleCategory" />

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
  <!-- /Header Category -->

  <!-- Table  -->
  <div class="flex-1 overflow-auto rounded-2xl bg-white py-2">
    <CategoryTable :columns="colCategory" :data="categoryStore.categories" @edite="handleEdite" @delete="openDelete"
      :page="pageNum" :limit="limit" @main="openInfo" />
  </div>
  <!-- /Table  -->

  <!-- Pagination -->
  <Pagination :page="pageNum" :limit="limit" :data="categoryStore" @next="nextPage" @prew="prewPage" @goPage="goPage" />
  <!-- /Pagination-->

  <!-- Modal -->
  <Teleport to="body">
    <!-- Add and Edite Modal -->
    <BaseModal :show="showModal" @close="closeModal">
      <template #header>
        <p>Тоифа{{ form._id ? "ни ўзгартириш" : " яратиш" }}</p>
        <p class="text-red-500 text-base">{{ alert }}</p>
      </template>
      <template #body>
        <BaseForm class="grid grid-cols-2 gap-2">
          <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
            @change="handleImage" />
          <BaseInput v-model="form.title" label="Тоифа номи" placeholder="Тоифа номи" inputType="string" />
        </BaseForm>
      </template>
      <template #button>
        <BaseButton @click="submitForm" class="w-32" color="green">Сақлаш</BaseButton>
      </template>
    </BaseModal>
    <!-- /Add and Edite Modal -->

    <!-- Delete Modal -->
    <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
      <div class="flex justify-center">
        <p class="text-gray-500">
          Сиз
          <span class="capitalize text-red-400">
            {{ categoryStore.categoryById?.title }}</span>
          тоифани ўчирмоқдасиз!
        </p>
      </div>
    </DeleteModal>
    <!-- /Delete Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Тоифа: {{ categoryStore.categoryById?.title }}</template>
      <template #body>
        <div v-if="!qrCodeStore.qrCodes.length"
          class="text-main overflow-auto rounded-2xl bg-white py-2 text-center h-96">
          Бу тоифага маҳсулот бириктирилмаган
        </div>
        <div v-else class="overflow-auto rounded-2xl bg-white py-2 min-h-[560px] lg:min-h-[750px]">
          <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="limitQrCode"
            :count="qrCodeStore.count" :summa="qrCodeStore.summa" @download="downloadFile" @showQr="showFile" />
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
  </Teleport>
  <!-- /Modal -->

</template>
