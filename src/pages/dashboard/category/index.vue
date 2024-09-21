<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from '@/stores/auth';
import { useCategoryStore } from "@/stores/category";
import { useQrCodeStore } from "@/stores/qrCode";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import { useRoute, useRouter } from 'vue-router';
import api from "@/plugins/axios";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import CategoryTable from "@/components/table/CategoryTable.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const qrCodeStore = useQrCodeStore();
const authStore = useAuthStore();
const showModal = ref(false);
const isDelete = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const pageNum = ref(1);
const pageInfo = ref(1);
const categoryId = ref('')
const titleCategory = ref('');
const qrCode = ref('');
const urlQrCode = ref('')
const limit = 8;

const columns = [
  { name: "№" },
  { name: "Расми" },
  { name: "Номи" },
  { name: "Маҳсулотлар сони" },
  { name: "Қр кодлари" },
  { name: "Статуси" },
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
  img: '',
  title: "",
})

async function handleImage(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  let image = await categoryStore.uploadCategory(formData);
  form.img = image.data
}

const handleDelete = async () => {
  pageNum.value = 1;
  await categoryStore.deleteCategory(categoryStore.categoryById?._id);
  await categoryStore.get(limit, pageNum.value, titleCategory.value);
  isDelete.value = false;
};

const handleEdite = async (id) => {
  await categoryStore.getCategoryById(id)
  form.img = categoryStore.categoryById.img;
  form._id = categoryStore.categoryById._id;
  form.title = categoryStore.categoryById.title;
  form.products = categoryStore.categoryById.products;
  form.codes = categoryStore.categoryById.codes;
  form.status = categoryStore.categoryById.status;
  showModal.value = true;
}

async function submitForm() {
  if (!form._id) {
    await categoryStore.addCategory(form);
  } else {
    await categoryStore.updateCategory(form);
  }
  await categoryStore.get(limit, pageNum.value, titleCategory.value);
  showModal.value = false;
  resetForm()
};

function openDelete(id) {
  isDelete.value = true;
  categoryStore.getCategoryById(id)
}

function resetForm() {
  delete form?._id
  form.img = "";
  form.title = "";
}

function closeModal() {
  showModal.value = false;
  resetForm()
}

async function goPage(n, item) {
  if (item === 'info') {
    pageInfo.value = n;
    await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', '', categoryId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', '', categoryId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', '', categoryId.value);
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function searchCategory() {
  pageNum.value = 1;
  await router.push({ name: "category", query: { page: pageNum.value, title: titleCategory.value } });
  await categoryStore.get(limit, pageNum.value, titleCategory.value);
}

async function openInfo(id) {
  isInfo.value = true;
  categoryId.value = id;
  await categoryStore.getCategoryById(id);
  await qrCodeStore.getAll(12, pageInfo.value, '', '', '', '', '', categoryId.value);
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
    const queryPage = route.query.page;
    const queryTitle = route.query.title;
    pageNum.value = Number(queryPage) || 1;
    titleCategory.value = queryTitle || '';
    await categoryStore.get(limit, pageNum.value, titleCategory.value)
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});

</script>
<template>
  <div class="flex flex-col gap-4">

    <!-- Header Category -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl text-[#1814F3] font-semibold">Тоифа</h3>
      <div class="flex gap-4 items-center">

        <!-- Filter title -->
        <input type="text"
          class="w-40 px-4 py-1.5 border rounded-md text-[#1814F3] focus:outline-none focus:border-[#1814F3] placeholder:text-[#8BA3CB]"
          placeholder="Тоифа номи" v-model="titleCategory" @input="searchCategory">
        <!-- /Filter title -->

        <BaseButton @click="showModal = true" class="text-green-600">
          Яратиш
        </BaseButton>
      </div>
    </div>
    <!-- /Header Category -->

    <!-- Table  -->
    <div class="h-[600px] overflow-auto bg-white rounded-2xl py-2">
      <CategoryTable :columns="columns" :data="categoryStore.categories" @edite="handleEdite" @delete="openDelete"
        :page="pageNum" :limit="limit" @main="openInfo" />
    </div>
    <!-- /Table  -->

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
      <span v-if="pageNum < Math.ceil(categoryStore.count / limit) - 1"
        class="cursor-pointer transition-all ease-linear px-2 rounded-md" @click="goPage(pageNum + 1)">
        {{ Number(pageNum) + 1 }}
      </span>
      <span v-if="pageNum < Math.ceil(categoryStore.count / limit) - 1">...</span>
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        v-if="Math.ceil(categoryStore.count / limit) > pageNum"
        :class="Math.ceil(categoryStore.count / limit) === pageNum ? 'text-white bg-[#1814F3]' : ''"
        @click="goPage(Math.ceil(categoryStore.count / limit))">
        {{ Math.ceil(categoryStore.count / limit) }}
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
        <template #header>Тоифа{{ form._id ? 'ни ўзгартириш' : ' яратиш' }}</template>
        <template #body>
          <BaseForm class="grid grid-cols-2 gap-2">
            <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
              @change="handleImage" />
            <BaseInput v-model="form.title" label="Тоифа номи" placeholder="Тоифа номи" inputType="string" />
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
          <p class="text-gray-500">Сиз
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
            class="lg:h-[640px] overflow-auto bg-white rounded-2xl py-2 text-center text-[#1814F3]">
            Бу тоифага маҳсулот бириктирилмаган
          </div>
          <div v-else class="lg:h-[660px] overflow-auto bg-white rounded-2xl py-2">
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
