<script setup>
import { ref } from "vue";
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid';
const isActive = ref(false)
const props = defineProps({
  label: String,
  placeholder: String,
  inputType: String,
  modelValue: [String, Number],
});
const emit = defineEmits(["update:modelValue"]);
</script>
<template>
  <div class="mb-4">
    <label class="block text-[#718EBF] text-sm font-bold mb-2" for="username">
      {{ props.label }}
    </label>
    <div class="flex items-center justify-between border rounded-md border-[#8BA3CB] w-64 py-2 px-3 ">
      <input
        class="appearance-none  text-[#8BA3CB] placeholder:text-[#8BA3CB] leading-tight focus:border-[#1814F3] focus:text-[#1814F3] focus:outline-none focus:shadow-outline"
        :type="isActive ? 'text' : 'password'" :placeholder="props.placeholder" :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)" required />
      <EyeIcon v-show="isActive"
        class="w-5 h-5 text-[#8BA3CB] cursor-pointer transition-all ease-linear hover:text-[#1814F3]"
        @click="isActive = !isActive" />
      <EyeSlashIcon v-show="!isActive"
        class="w-5 h-5 text-[#8BA3CB] cursor-pointer transition-all ease-linear hover:text-[#1814F3]"
        @click="isActive = !isActive" />
    </div>
  </div>
</template>