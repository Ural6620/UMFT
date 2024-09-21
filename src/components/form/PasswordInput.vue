<script setup>
import { ref } from "vue";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";
const isActive = ref(false);
const props = defineProps({
  label: String,
  placeholder: String,
  inputType: String,
});
const modelValue = defineModel();
</script>
<template>
  <div class="w-full">
    <label class="mb-2 block text-sm font-bold text-[#718EBF]" for="username">
      {{ props.label }}
    </label>
    <div
      class="flex w-full items-center justify-between rounded-md border border-[#8BA3CB] px-3 py-2"
    >
      <input
        class="focus:shadow-outline focus:border-main focus:text-main appearance-none leading-tight text-[#8BA3CB] placeholder:text-[#8BA3CB] focus:outline-none"
        :type="isActive ? 'text' : 'password'"
        :placeholder="props.placeholder"
        v-model="modelValue"
        required
      />
      <EyeIcon
        v-show="isActive"
        class="hover:text-main h-5 w-5 cursor-pointer text-[#8BA3CB] transition-all ease-linear"
        @click="isActive = !isActive"
      />
      <EyeSlashIcon
        v-show="!isActive"
        class="hover:text-main h-5 w-5 cursor-pointer text-[#8BA3CB] transition-all ease-linear"
        @click="isActive = !isActive"
      />
    </div>
  </div>
</template>
