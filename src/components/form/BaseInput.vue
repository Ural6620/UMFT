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
  <div class="w-full">
    <label class="mb-2 block text-sm font-bold text-[#718EBF]" for="username">
      {{ props.label }}
    </label>
    <input
      class="focus:shadow-outline focus:border-main focus:text-main w-full appearance-none rounded-md border border-[#8BA3CB] px-3 py-2 leading-tight text-[#8BA3CB] placeholder:text-[#8BA3CB] focus:outline-none"
      :type="props.inputType"
      :placeholder="props.placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      required
    />
  </div>
</template>
