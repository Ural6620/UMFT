<script setup>
import { ref, reactive, onMounted } from "vue";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import { useAuthStore } from '@/stores/auth';
import { useRoomStore } from "@/stores/room";
import { useFilialStore } from "@/stores/filial";
import { useQrCodeStore } from "@/stores/qrCode";
import { useRoute, useRouter } from 'vue-router';
import api from "@/plugins/axios";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import BaseTable from "@/components/table/RoomTable.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const roomStore = useRoomStore();
const filialStore = useFilialStore();
const qrCodeStore = useQrCodeStore();
const isDelete = ref(false);
const isFilial = ref(false);
const isInfo = ref(false);
const showQr = ref(false);
const showModal = ref(false);
const pageNum = ref(1);
const pageInfo = ref(1);
const roomId = ref('');
const filialId = ref('');
const titleRoom = ref('');
const filialSelect = ref('');
const orderRoom = ref('');
const qrCode = ref('');
const urlQrCode = ref('');
const limit = 15;

const form = reactive({
  title: "",
  number: "",
  filial: "",
  type: "",
  status: "",
});

const columns = [
  { name: "№" },
  { name: "Номи" },
  { name: "Рақами" },
  { name: "Филиал" },
  { name: "Тури" },
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

const status = [{ id: 1, name: "Фаол" }, { id: 2, name: "Фаол емас" }, 2];
const type = [{ id: 1, name: "Ўқув хонаси" }, { id: 2, name: "Маиший хона" }, 2];

const handleDelete = async () => {
  pageNum.value = 1;
  await roomStore.deleteRoom(roomStore.roomById._id);
  await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value);
  isDelete.value = false;
};

const handleEdite = async (id) => {
  await roomStore.getRoomById(id);
  form._id = roomStore.roomById._id;
  form.title = roomStore.roomById.title;
  form.number = roomStore.roomById.number;
  form.filial = roomStore.roomById.filial._id;
  form.status = roomStore.roomById.status === 1 ? 'Фаол' : 'Фаол емас';
  form.type = roomStore.roomById.type === 1 ? "Ўқув хонаси" : "Маиший хона";
  showModal.value = true;
};

const submitForm = async () => {
  if (!form._id) {
    await roomStore.addRoom(form);
  } else {
    await roomStore.updateRoom(form);
  }
  await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value, orderRoom.value);
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  delete form._id;
  form.title = "";
  form.number = "";
  form.filial = "";
  form.type = "";
  form.status = "";
};

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function openDelete(id) {
  await roomStore.getRoomById(id);
  isDelete.value = true;
}

async function goPage(n, item) {
  if (item === 'info') {
    pageInfo.value = n;
    await qrCodeStore.getAll(12, pageInfo.value, '', filialId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, '', filialId.value);
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
    await qrCodeStore.getAll(12, pageInfo.value, '', filialId.value);
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}


async function filterFilial(item) {
  pageNum.value = 1;
  filialId.value = item._id || '';
  filialSelect.value = item.title || 'Барча филиаллар';
  filialStore.get(0)
  router.push({ name: "rooms", query: { page: pageNum.value, room: titleRoom.value, filial: filialId.value, filialTitle: filialSelect.value } });
  await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value, orderRoom.value);
  isFilial.value = false;
}

async function searchRoomTitle() {
  pageNum.value = 1;
  router.push({ name: "rooms", query: { page: pageNum.value, room: titleRoom.value, filial: filialId.value } });
  await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value);
}

async function searchRoomOrder() {
  pageNum.value = 1;
  router.push({ name: "rooms", query: { page: pageNum.value, room: titleRoom.value, filial: filialId.value } });
  await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value, orderRoom.value);
}

async function openInfo(id) {
  isInfo.value = true;
  roomId.value = id;
  await roomStore.getRoomById(id);
  await qrCodeStore.getAll(12, pageInfo.value, '', roomId.value);
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
    await filialStore.get(0);
    const queryPage = Number(route.query.page) || 1;
    const queryRoom = route.query.room || '';
    const queryFilialId = route.query.filial || '';
    const queryFilialTitle = route.query.filialTitle || 'Филиални танлаш';
    pageNum.value = queryPage;
    titleRoom.value = queryRoom;
    filialId.value = queryFilialId;
    filialSelect.value = queryFilialTitle;
    await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value);
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});

</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Room Header section -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl text-[#1814F3] font-semibold">Хона</h3>
      <div class="flex gap-4 items-center">

        <!-- Filter title -->
        <input type="text"
          class="w-28 truncate lg:w-48 px-4 py-1.5 border rounded-md text-[#1814F3] focus:outline-none focus:border-[#1814F3] placeholder:text-[#8BA3CB]"
          placeholder="Хона номи" v-model="titleRoom" @input="searchRoomTitle">
        <!-- /Filter title -->

        <!-- Filter title -->
        <input type="text"
          class="w-28 truncate lg:w-48 px-4 py-1.5 border rounded-md text-[#1814F3] focus:outline-none focus:border-[#1814F3] placeholder:text-[#8BA3CB]"
          placeholder="Хона рақами" v-model="orderRoom" @input="searchRoomOrder">
        <!-- /Filter title --

        <!-- Filter filial -->
        <div class="relative w-32 lg:w-48 transition-all duration-1000">
          <button type="button" @click="isFilial = !isFilial"
            class="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-6 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-[#1814F3] sm:text-sm sm:leading-6"
            aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
            <span class="flex items-center justify-between">
              <span class=" block truncate text-[#8BA3CB]">{{ filialSelect }}</span>
              <ChevronDownIcon class="w-4 h-4 text-[#8BA3CB] transition ease-linear duration-300 relative -right-6"
                :class="isFilial ? 'transform rotate-180' : ''" />
            </span>
          </button>
          <ul v-show="isFilial"
            class="absolute max-h-56 z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg  ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
            <li
              class="relative cursor-default select-none pl-3 py-1 pr-9 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
              id="listbox-option-0" role="option" @click="filterFilial({ _id: '', title: 'Барча филиаллар' })">
              <div class="flex items-center cursor-pointer group">
                <span
                  class="ml-3 block truncate font-normal transition ease-linear text-[#8BA3CB] group-hover:text-[#1814F3]">
                  Барча филиаллар
                </span>
              </div>
            </li>
            <li
              class="relative cursor-default select-none pl-3 py-1 pr-9 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
              id="listbox-option-0" role="option" v-for="item in filialStore.filials" @click="filterFilial(item)">
              <div class="flex items-center cursor-pointer group">
                <span
                  class="ml-3 block truncate font-normal transition ease-linear text-[#8BA3CB] group-hover:text-[#1814F3]">
                  {{ item.title }}
                </span>
              </div>
            </li>
          </ul>
        </div>
        <!-- /Filter filial -->

        <BaseButton @click="showModal = true" class="text-green-600">
          Яратиш
        </BaseButton>
      </div>
    </div>
    <!-- /Room Header section -->

    <!-- Table Section -->
    <div class="h-[660px] bg-white rounded-2xl py-2 overflow-auto">
      <BaseTable :columns="columns" :data="roomStore.rooms" @delete="openDelete" @edite="handleEdite" :page="pageNum"
        :limit="limit" @main="openInfo" />
    </div>
    <!-- /Table section -->



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
      <span v-if="pageNum < Math.ceil(roomStore.count / limit) - 1"
        class="cursor-pointer transition-all ease-linear px-2 rounded-md" @click="goPage(pageNum + 1)">
        {{ Number(pageNum) + 1 }}
      </span>
      <span v-if="pageNum < Math.ceil(roomStore.count / limit) - 1">...</span>
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        v-if="Math.ceil(roomStore.count / limit) > pageNum"
        :class="Math.ceil(roomStore.count / limit) === pageNum ? 'text-white bg-[#1814F3]' : ''"
        @click="goPage(Math.ceil(roomStore.count / limit))">
        {{ Math.ceil(roomStore.count / limit) }}
      </span>
      <span class="flex gap-1 items-center cursor-pointer" @click="nextPage">
        <ChevronRightIcon class="w-4 h-4" />
      </span>
    </div>
    <!-- /Pagination-->

    <!-- Modal  -->
    <Teleport to="body">
      <BaseModal :show="showModal" @close="closeModal">
        <template #header>Хона{{ form._id ? 'ни ўзгартириш' : ' яратиш' }}</template>
        <template #body>
          <BaseForm class="grid grid-cols-2 gap-2">
            <BaseInput v-model="form.title" label="Хона номи" placeholder="Хона номи" inputType="string" />
            <BaseInput v-model="form.number" label="Хона рақами" placeholder="Хона рақами" inputType="number" />
            <SelectFilial label="Филиал"
              :placeholder="form.filial ? roomStore.roomById?.filial?.title : 'Филиални танланг'"
              :data="filialStore.filials" v-model="form.filial" />
            <BaseSelect label="Typи" :placeholder="form.type || 'Хона турини танланг'" :data="type"
              v-model="form.type" />
            <BaseSelect label="Статус" :placeholder="form.status || 'Хона статусини танланг'" :data="status"
              v-model="form.status" />
          </BaseForm>
        </template>
        <template #button>
          <button @click="submitForm"
            class="w-32 bg-blue-100 text-blue-600 hover:bg-blue-300 transition-all ease-linear rounded-md py-1">
            Сақлаш
          </button>
        </template>
      </BaseModal>

      <!-- Delete Modal -->
      <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
        <div class="flex justify-center">
          <p class="text-gray-500"> Сиз <span class="capitalize text-red-400">
              {{ roomStore.roomById.title }}
            </span>ни учирмоқдасиз!</p>
        </div>
      </DeleteModal>
      <!-- /Delete Modal -->

      <!-- Info Modal -->
      <InfoRoomModal :show="isInfo" @close="closeInfo">
        <template #header>Хона: {{ roomStore.roomById?.number }}</template>
        <template #body>
          <div v-if="!qrCodeStore.qrCodes.length"
            class="lg:h-[640px] overflow-auto bg-white rounded-2xl py-2 text-center text-[#1814F3]">
            Бу хонага маҳсулот бириктирилмаган
          </div>
          <div v-else class="lg:h-[660px]  overflow-auto bg-white rounded-2xl py-2">
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
    <!-- /Modal  -->

  </div>
</template>