<script setup>
import { reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { EyeIcon } from "@heroicons/vue/24/solid";
import PasswordInput from "@/components/form/PasswordInput.vue";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  login: "",
  password: "",
});

const submitForm = async () => {
  if (form.login && form.password) {
    await authStore.login({
      login: form.login,
      password: form.password,
    });

    if (authStore.isAuthenticated) {
      router.push("/");
    } else {
      console.error("Login muvaffaqiyatsiz bo'ldi");
    }
  }
};

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    router.push("/");
  }
});
</script>
<template>
  <div class="lg:grid grid-cols-2 w-screen h-screen">
    <div class="absolute lg:sticky top-0 w-full h-screen ">
      <img class="w-full h-full " src="@/assets/Без названия.png" alt="image UMFT">
    </div>
    <div class="w-full h-full flex flex-col items-center justify-center z-10 relative">
      <form @submit.prevent="submitForm"
        class="w-96 h-auto bg-white rounded-md shadow-md flex flex-col items-center py-10">
        <BaseInput label="Логин" placeholder="Логинингизни киритинг" input-type="text" v-model="form.login"
          class="w-64" />
        <PasswordInput label="Парол" placeholder="Паролингизни киритинг" input-type="password" v-model="form.password"
          :icon="EyeIcon" />
        <button
          class="rounded-md px-4 py-1.5 bg-blue-100 text-blue-600 transition ease-linear duration-300 outline-blue-400 hover:bg-blue-300"
          type="submit">
          Кириш
        </button>
      </form>
    </div>
  </div>
</template>
