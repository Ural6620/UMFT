<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFilialStore } from "@/stores/filial";
import { useRoute, useRouter } from "vue-router";
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon, PlusIcon } from "@heroicons/vue/24/solid";
import { colFilial } from "@/components/constants/constants";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DeleteModal from "@/components/ui/DeleteModal.vue";
import BaseForm from "@/components/form/BaseForm.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import FilialTable from "@/components/table/FilialTable.vue";
import Pagination from "@/components/ui/Pagination.vue";

const route = useRoute();
const router = useRouter();
const filialStore = useFilialStore();
const authStore = useAuthStore();
const showModal = ref(false);
const isDelete = ref(false);
const pageNum = ref(1);
const titleFilial = ref("");
const limit = 8;
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

async function goPage(n) {
  pageNum.value = n;
  await router.push({
    name: "filial",
    query: { page: pageNum.value, filial: titleFilial.value },
  });
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
async function filter() {
  pageNum.value = 1;
  await router.push({
    name: "filial",
    query: { page: pageNum.value, filial: titleFilial.value },
  });
  await filialStore.get(limit, pageNum.value, titleFilial.value);
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
  <!-- /Header Category -->

  <!-- Table -->
  <div class="flex-1 overflow-auto rounded-2xl bg-white py-2">
    <FilialTable :columns="colFilial" :data="filialStore.filials" @delete="openDelete" @edite="handleEdite"
      :page="pageNum" :limit="limit" />
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
  </Teleport>
  <!-- /Modal -->

</template>
