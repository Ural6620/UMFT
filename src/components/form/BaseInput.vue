<script setup>
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
    <input
      class="appearance-none border rounded-md border-[#8BA3CB] w-full py-2 px-3  text-[#8BA3CB] placeholder:text-[#8BA3CB] leading-tight focus:border-[#1814F3] focus:text-[#1814F3] focus:outline-none focus:shadow-outline"
      :type="props.inputType" :placeholder="props.placeholder" :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)" required />
  </div>
</template>
