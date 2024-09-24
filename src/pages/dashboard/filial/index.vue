<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFilialStore } from "@/stores/filial";
import { useRoute, useRouter } from "vue-router";
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon, PlusIcon } from "@heroicons/vue/24/solid";
import { useQrCodeStore } from "@/stores/qrCode";
import { colFilial } from "@/components/constants/constants";
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
const authStore = useAuthStore();
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
const limit = 8;
const filialId = ref("");
const form = reactive({
  img: "",
  title: "",
  number: "",
  address: "",
});

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
  try {
    if (!form._id) {
      await filialStore.addFilial(form);
    } else {
      await filialStore.updateFilial(form);
    }
    await filialStore.get(limit, pageNum.value, titleFilial.value);
    showModal.value = false;
    resetForm();
  } catch (error) {
    console.error("Yuborishda xatolik:", error);
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
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(12, pageInfo.value, "", "", '', '', '', '', filialId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, "", "", '', '', '', '', filialId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, "", "", '', '', '', '', filialId.value);
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
    name: "filial",
    query: { page: pageNum.value, filial: titleFilial.value },
  });
  await filialStore.get(limit, pageNum.value, titleFilial.value);
}
async function openInfo(id) {
  isInfo.value = true;
  filialId.value = id;
  await filialStore.getFilialById(id);
  await qrCodeStore.getAll(12, pageInfo.value, "", "", '', '', '', '', filialId.value);
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
  titleFilial.value = "";
  pageNum.value = 1;
  router.push({
    name: "filial",
    query: { page: pageNum.value, filial: titleFilial.value },
  });
  filialStore.get(limit, pageNum.value, titleFilial.value);
}

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    const queryPage = Number(route.query.page) || 1;
    const queryFilialTitle = route.query.filial || "";

    pageNum.value = queryPage;
    titleFilial.value = queryFilialTitle;
    await filialStore.get(limit, pageNum.value, titleFilial.value);
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});
</script>

<template>
  <!-- Header Category -->
  <div class="flex items-center justify-between pb-4">
    <h3 class="text-main text-xl font-semibold">Филиал</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-40 rounded-md border px-4 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Филиал номи" v-model="titleFilial" />

      <BaseButton @click="filter" color="yellow">
        <ArchiveBoxArrowDownIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="red">
        <ArchiveBoxXMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="showModal = true" color="blue">
        <PlusIcon class="h-5 w-5" />
      </BaseButton>
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
      <template #header>Филиал{{ form._id ? "ни Узгартириш" : " яратиш" }}</template>
      <template #body>
        <BaseForm class="grid grid-cols-2 gap-2">
          <BaseInput label="Расм" inputType="file" :placeholder="form.img ? form.img : 'add image'"
            @change="handleImage" />
          <BaseInput v-model="form.title" label="Номи" placeholder="Номи" inputType="string" />
          <BaseInput v-model="form.number" label="Рақами" placeholder="Рақами" inputType="number" />
          <BaseInput v-model="form.address" label="Манзили" placeholder="Манзили" inputType="string" />
        </BaseForm>
      </template>
      <template #button>
        <button @click="submitForm"
          class="w-32 rounded-md bg-blue-100 py-1 text-blue-600 transition-all ease-linear hover:bg-blue-300">
          Сақлаш
        </button>
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
          class="text-main overflow-auto rounded-2xl bg-white py-2 text-center lg:h-[640px]">
          Бу филиалга маҳсулот бириктирилмаган
        </div>
        <div v-else class="overflow-auto rounded-2xl bg-white py-2 lg:h-[660px]">
          <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="12"
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
  </Teleport>
  <!-- /Modal  -->

</template>
