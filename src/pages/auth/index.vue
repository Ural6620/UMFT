<script setup>
import { reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import BaseInput from "@/components/form/BaseInput.vue";
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
  <div class="bg-main flex h-screen w-screen items-center justify-center">
    <div class="flex flex-col items-center justify-center gap-4">
      <img src="@/assets/logo.svg" alt="" class="w-[384px]" />
      <div class="text-center text-[36px] font-bold text-white">
        Инвентаризация
      </div>
      <form @submit.prevent="submitForm"
        class="flex h-auto w-96 flex-col items-center gap-4 rounded-md bg-white p-8 py-10 shadow-md">
        <BaseInput label="Логин" placeholder="Логинингизни киритинг" input-type="text" v-model="form.login" />
        <PasswordInput label="Парол" placeholder="Паролингизни киритинг" input-type="password" v-model="form.password"
          :icon="EyeIcon" />
        <button class="btn-primary" type="submit">Кириш</button>
      </form>
    </div>
  </div>
</template>
