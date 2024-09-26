<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ChevronDownIcon, PlusIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from "@heroicons/vue/24/solid";
import { useRoomStore } from "@/stores/room";
import { useFilialStore } from "@/stores/filial";
import { useQrCodeStore } from "@/stores/qrCode";
import { useRoute, useRouter } from "vue-router";
import { colRoom, colInfo, status, typeRoom } from "@/components/constants/constants";
import api from "@/plugins/axios";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import SelectFilial from "@/components/form/SelectFilial.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import InfoRoomModal from "@/components/ui/InfoRoomModal.vue";
import RoomTable from "@/components/table/RoomTable.vue";
import qrCodeTable from "@/components/table/qrCodeTable.vue";
import Pagination from "@/components/ui/Pagination.vue";

const route = useRoute();
const router = useRouter();
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
const roomId = ref("");
const filialId = ref("");
const titleRoom = ref("");
const filialSelect = ref("");
const orderRoom = ref("");
const qrCode = ref("");
const urlQrCode = ref("");
const limit = 20;
const limitQrCode = 14;
const isLargeScreen = ref(window.innerWidth >= 760);
const isMobile = ref(false);
const alert = ref('')

const form = reactive({
  title: "",
  number: "",
  filial: "",
  type: "",
  status: "",
});

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
  form.status = roomStore.roomById.status === 1 ? "Фаол" : "Фаол емас";
  form.type = roomStore.roomById.type === 1 ? "Ўқув хонаси" : "Маиший хона";
  showModal.value = true;
};

const submitForm = async () => {
  if (!form.title) {
    alert.value = "Хона номини киритинг";
  } else if (!form.number) {
    alert.value = "Хона рақамини киритинг";
  } else if (!form.filial) {
    alert.value = "Филални танланг";
  } else if (!form.type) {
    alert.value = "Типни танланг";
  } else if (!form.status) {
    alert.value = "Статусни танланг";
  } else {
    if (!form._id) {
      await roomStore.addRoom(form);
    } else {
      await roomStore.updateRoom(form);
    }
    await roomStore.get(
      limit,
      pageNum.value,
      titleRoom.value,
      filialId.value,
      orderRoom.value,
    );
    showModal.value = false;
    resetForm();
  }
};

const resetForm = () => {
  delete form._id;
  form.title = "";
  form.number = "";
  form.filial = "";
  form.type = "";
  form.status = "";
  alert.value = ''
};

function closeModal() {
  showModal.value = false;
  resetForm();
}

async function openDelete(id) {
  await roomStore.getRoomById(id);
  isDelete.value = true;
}
function openModal() {
  isMobile.value = false;
  showModal.value = true;
}

async function goPage(n, item) {
  if (item === "info") {
    pageInfo.value = n;
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", roomId.value);
  } else {
    pageNum.value = n;
    router.push({
      name: "rooms",
      query: {
        page: pageNum.value,
        room: titleRoom.value,
        filial: filialId.value,
      },
    });
    await roomStore.get(
      limit,
      pageNum.value,
      titleRoom.value,
      filialId.value,
      orderRoom.value,
    );
  }
}

async function prewPage(item) {
  if (item === "info") {
    if (pageInfo.value > 1) {
      pageInfo.value--;
    }
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", roomId.value);
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
    await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", roomId.value);
  } else {
    const maxPage = Math.ceil(roomStore.count / limit);
    if (pageNum.value < maxPage) {
      pageNum.value++;
    }
    await goPage(pageNum.value);
  }
}

async function filterFilial(item) {
  isFilial.value = false;
  isMobile.value = false;
  pageNum.value = 1;
  filialId.value = item._id || "";
  filialSelect.value = item.title || "Барча филиаллар";
  filialStore.get(0);
  router.push({
    name: "rooms",
    query: {
      page: pageNum.value,
      room: titleRoom.value,
      filial: filialId.value,
      filialTitle: filialSelect.value,
    },
  });
  await roomStore.get(
    limit,
    pageNum.value,
    titleRoom.value,
    filialId.value,
    orderRoom.value,
  );
  isFilial.value = false;
}

async function filter() {
  isMobile.value = false;
  pageNum.value = 1;
  router.push({
    name: "rooms",
    query: {
      page: pageNum.value,
      room: titleRoom.value,
      filial: filialId.value,
    },
  });
  await roomStore.get(
    limit,
    pageNum.value,
    titleRoom.value,
    filialId.value,
    orderRoom.value,
  );
}

async function openInfo(id) {
  isInfo.value = true;
  roomId.value = id;
  await roomStore.getRoomById(id);
  await qrCodeStore.getAll(limitQrCode, pageInfo.value, "", roomId.value);
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
  titleRoom.value = "";
  orderRoom.value = "";
  pageNum.value = 1;
  filialId.value = "";
  filialSelect.value = "Филиални танлаш";
  router.push({
    name: "rooms",
    query: {
      page: pageNum.value,
      room: titleRoom.value,
      filial: filialId.value,
    },
  });
  roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value);
}

function handleResize() {
  isLargeScreen.value = window.innerWidth > 760;
}

function reload() {
  qrCodeStore.getAll(limitQrCode, pageInfo.value, "", roomId.value);
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  await filialStore.get(0);
  const queryPage = Number(route.query.page) || 1;
  const queryRoom = route.query.room || "";
  const queryFilialId = route.query.filial || "";
  const queryFilialTitle = route.query.filialTitle || "Филиални танлаш";
  pageNum.value = queryPage;
  titleRoom.value = queryRoom;
  filialId.value = queryFilialId;
  filialSelect.value = queryFilialTitle;
  await roomStore.get(limit, pageNum.value, titleRoom.value, filialId.value);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <!-- Room Header section -->
  <div v-if="isLargeScreen" class="flex items-center justify-between pb-4 relative">
    <h3 class="text-main text-xl font-semibold block">Хона</h3>
    <div class="flex items-center gap-4">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-56 truncate rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none "
        placeholder="Хона номи" v-model="titleRoom" />
      <!-- /Filter title -->

      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-56 truncate rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Хона рақами" v-model="orderRoom" />
      <!-- /Filter title --

        <!-- Filter filial -->
      <div class="relative transition-all duration-1000 w-56 z-20">
        <button type="button" @click="isFilial = !isFilial"
          class="focus:ring-main relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
          aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
          <span class="flex items-center justify-between">
            <span class="block truncate text-[#8BA3CB]">{{
              filialSelect
            }}</span>
            <ChevronDownIcon class="relative -right-6 h-4 w-4 text-[#8BA3CB] transition duration-300 ease-linear"
              :class="isFilial ? 'rotate-180 transform' : ''" />
          </span>
        </button>
        <ul v-show="isFilial"
          class="absolute z-10 mt-1 py-2 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
          <li
            class="relative cursor-default select-none py-1 pl-3 pr-9 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
            id="listbox-option-0" role="option" @click="filterFilial({ _id: '', title: 'Барча филиаллар' })">
            <div class="group flex cursor-pointer items-center">
              <span class="group-hover:text-main block truncate font-normal text-[#8BA3CB] transition ease-linear">
                Барча филиаллар
              </span>
            </div>
          </li>
          <li
            class="relative cursor-default select-none py-1 pl-3 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
            id="listbox-option-0" role="option" v-for="item in filialStore.filials" @click="filterFilial(item)">
            <div class="group flex cursor-pointer items-center">
              <span class="group-hover:text-main block truncate font-normal text-[#8BA3CB] transition ease-linear">
                {{ item.title }}
              </span>
            </div>
          </li>
        </ul>
      </div>
      <!-- /Filter filial -->
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
    <h3 class="text-main text-xl font-semibold">Хона</h3>
    <BaseButton @click="isMobile = true">
      <Bars3Icon class="h-5 w-5" />
    </BaseButton>
    <div v-if="isMobile"
      class="flex flex-col items-center absolute gap-4 top-0 right-0 bg-white p-10 z-50 w-screen h-screen">
      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-full truncate rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Хона номи" v-model="titleRoom" />
      <!-- /Filter title -->

      <!-- Filter title -->
      <input type="text"
        class="text-main focus:border-main w-full truncate rounded-md border px-3 py-1.5 placeholder:text-[#8BA3CB] focus:outline-none"
        placeholder="Хона рақами" v-model="orderRoom" />
      <!-- /Filter title --

        <!-- Filter filial -->
      <div class="relative w-full transition-all duration-1000 z-10">
        <button type="button" @click="isFilial = !isFilial"
          class="focus:ring-main relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm sm:leading-6"
          aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
          <span class="flex items-center justify-between">
            <span class="block truncate text-[#8BA3CB]">{{
              filialSelect
            }}</span>
            <ChevronDownIcon class="relative -right-6 h-4 w-4 text-[#8BA3CB] transition duration-300 ease-linear"
              :class="isFilial ? 'rotate-180 transform' : ''" />
          </span>
        </button>
        <ul v-show="isFilial"
          class="absolute z-10 mt-1 py-2 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
          <li
            class="relative cursor-default select-none py-1 pl-3 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
            id="listbox-option-0" role="option" @click="filterFilial({ _id: '', title: 'Барча филиаллар' })">
            <div class="group flex cursor-pointer items-center">
              <span class="group-hover:text-main block truncate font-normal text-[#8BA3CB] transition ease-linear">
                Барча филиаллар
              </span>
            </div>
          </li>
          <li
            class="relative cursor-default select-none py-1 pl-3 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
            id="listbox-option-0" role="option" v-for="item in filialStore.filials" @click="filterFilial(item)">
            <div class="group flex cursor-pointer items-center">
              <span class="group-hover:text-main block truncate font-normal text-[#8BA3CB] transition ease-linear">
                {{ item.title }}
              </span>
            </div>
          </li>
        </ul>
      </div>
      <!-- /Filter filial -->
      <BaseButton @click="filter" color="yellow" class="w-1/2">
        <MagnifyingGlassIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="clear" color="red" class="w-1/2">
        <XMarkIcon class="h-4 w-4" />
      </BaseButton>
      <BaseButton @click="openModal" color="blue" class="w-1/2">
        <PlusIcon class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>
  <!-- /Room Header section -->

  <!-- Table Section -->
  <div class="flex-1 h-full overflow-auto rounded-2xl bg-white py-2">
    <RoomTable :columns="colRoom" :data="roomStore.rooms" @delete="openDelete" @edite="handleEdite" :page="pageNum"
      :limit="limit" @main="openInfo" />
  </div>
  <!-- /Table section -->

  <!-- Pagination -->
  <Pagination :page="pageNum" :limit="limit" :data="roomStore" @next="nextPage" @prew="prewPage" @goPage="goPage" />
  <!-- /Pagination-->

  <!-- Modal  -->
  <Teleport to="body">
    <BaseModal :show="showModal" @close="closeModal">
      <template #header>
        <p>Хона{{ form._id ? "ни ўзгартириш" : " яратиш" }}</p>
        <p class="text-red-500 text-base">{{ alert }}</p>
      </template>
      <template #body>
        <BaseForm class="grid grid-cols-2 gap-2">
          <BaseInput v-model="form.title" label="Хона номи" placeholder="Хона номи" inputType="string" />
          <BaseInput v-model="form.number" label="Хона рақами" placeholder="Хона рақами" inputType="number" />
          <SelectFilial label="Филиал" :placeholder="form.filial
            ? roomStore.roomById?.filial?.title
            : 'Филиални танланг'
            " :data="filialStore.filials" v-model="form.filial" />
          <BaseSelect label="Typи" :placeholder="form.type || 'Хона турини танланг'" :data="typeRoom"
            v-model="form.type" />
          <BaseSelect label="Статус" :placeholder="form.status || 'Хона статусини танланг'" :data="status"
            v-model="form.status" />
        </BaseForm>

      </template>
      <template #button>
        <BaseButton class="w-32" @click="submitForm" color="green">Сақлаш</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Modal -->
    <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
      <div class="flex justify-center">
        <p class="text-gray-500">
          Сиз
          <span class="capitalize text-red-400">
            {{ roomStore.roomById.title }} </span>ни учирмоқдасиз!
        </p>
      </div>
    </DeleteModal>
    <!-- /Delete Modal -->

    <!-- Info Modal -->
    <InfoRoomModal :show="isInfo" @close="closeInfo">
      <template #header>Хона: {{ roomStore.roomById?.number }}</template>
      <template #body>
        <div v-if="!qrCodeStore.qrCodes.length"
          class="text-main overflow-auto rounded-2xl bg-white py-2 text-center h-96">
          Бу хонага маҳсулот бириктирилмаган
        </div>
        <div v-else class="overflow-auto rounded-2xl bg-white py-2 min-h-[560px] lg:min-h-[750px]">
          <qrCodeTable :columns="colInfo" :data="qrCodeStore.qrCodes" :page="pageInfo" :limit="limitQrCode"
            :count="qrCodeStore.count" :summa="qrCodeStore.summa" @download="downloadFile" @showQr="showFile"
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
    <!-- /showModal -->
  </Teleport>
  <!-- /Modal  -->

</template>
