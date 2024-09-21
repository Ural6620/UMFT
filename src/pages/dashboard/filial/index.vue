<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from '@/stores/auth';
import { useFilialStore } from "@/stores/filial";
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import FilialTable from "@/components/table/FilialTable.vue";

const route = useRoute();
const router = useRouter();
const filialStore = useFilialStore();
const authStore = useAuthStore();
const showModal = ref(false);
const isDelete = ref(false);
const pageNum = ref(1);
const titleFilial = ref('');
const limit = 8;
const form = reactive({
  img: "",
  title: "",
  number: "",
  address: "",
});

const columns = [
  { name: "№" },
  { name: "Расми" },
  { name: "Номи" },
  { name: "Рақами" },
  { name: "Манзили" },
  { name: "Статуси" },
  { name: "", },
];

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

async function goPage(n) {
  pageNum.value = n;
  await router.push({ name: "filial", query: { page: pageNum.value, filial: titleFilial.value } });
  await filialStore.get(limit, pageNum.value, titleFilial.value);
}
async function prewPage() {
  if (pageNum.value > 1) {
    pageNum.value--;
  }
  goPage(pageNum.value);
}

async function nextPage() {
  const maxPage = Math.ceil(filialStore.count / limit);
  if (pageNum.value < maxPage) {
    pageNum.value++;
  }
  goPage(pageNum.value);
}
async function searchFilial() {
  pageNum.value = 1;
  await router.push({ name: "filial", query: { page: pageNum.value, filial: titleFilial.value } });
  await filialStore.get(limit, pageNum.value, titleFilial.value);
}

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    const queryPage = Number(route.query.page) || 1;
    const queryFilialTitle = route.query.filial || '';

    pageNum.value = queryPage;
    titleFilial.value = queryFilialTitle;
    await filialStore.get(limit, pageNum.value, titleFilial.value);
  } else {
    console.error("Autentifikatsiya muvaffaqiyatsiz");
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Header Category -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl text-[#1814F3] font-semibold">Филиал</h3>
      <div class="flex gap-4 items-center">

        <!-- Filter title -->
        <input type="text"
          class="w-40 px-4 py-1.5 border rounded-md text-[#1814F3] focus:outline-none focus:border-[#1814F3] placeholder:text-[#8BA3CB]"
          placeholder="Филиал номи" v-model="titleFilial" @input="searchFilial">
        <!-- /Filter title -->

        <BaseButton @click="showModal = true" class="text-green-600">
          Яратиш
        </BaseButton>
      </div>
    </div>
    <div class="h-[600px] overflow-auto bg-white rounded-2xl py-2">
      <FilialTable :columns="columns" :data="filialStore.filials" @delete="openDelete" @edite="handleEdite"
        :page="pageNum" :limit="limit" />
    </div>
    <!-- /Header Category -->

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
      <span v-if="pageNum < Math.ceil(filialStore.count / limit) - 1"
        class="cursor-pointer transition-all ease-linear px-2 rounded-md" @click="goPage(pageNum + 1)">
        {{ Number(pageNum) + 1 }}
      </span>
      <span v-if="pageNum < Math.ceil(filialStore.count / limit) - 1">...</span>
      <span class="cursor-pointer transition-all ease-linear px-2 rounded-md"
        v-if="Math.ceil(filialStore.count / limit) > pageNum"
        :class="Math.ceil(filialStore.count / limit) === pageNum ? 'text-white bg-[#1814F3]' : ''"
        @click="goPage(Math.ceil(filialStore.count / limit))">
        {{ Math.ceil(filialStore.count / limit) }}
      </span>
      <span class="flex gap-1 items-center cursor-pointer" @click="nextPage">
        <ChevronRightIcon class="w-4 h-4" />
      </span>
    </div>
    <!-- /Pagination-->

    <!-- Modal -->
    <Teleport to="body">
      <!-- Add end Create Modal -->
      <BaseModal :show="showModal" @close="closeModal">
        <template #header>Филиал{{ form._id ? 'ни Узгартириш' : ' яратиш' }}</template>
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
            class="w-32 bg-blue-100 text-blue-600 hover:bg-blue-300 transition-all ease-linear rounded-md py-1">
            Сақлаш
          </button>
        </template>
      </BaseModal>
      <!-- /Add end Create Modal -->

      <!-- Delete Modal -->
      <DeleteModal :show="isDelete" @close="isDelete = false" @delete="handleDelete">
        <div class="flex justify-center">
          <p class="text-gray-500"> Сиз <span class="capitalize text-red-400">
              {{ filialStore.filialById?.title }}
            </span> филифлини учирмоқдасиз!</p>
        </div>
      </DeleteModal>

      <!-- /Delete Modal -->
    </Teleport>
    <!-- /Modal -->
  </div>
</template>
