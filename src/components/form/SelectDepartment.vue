<script setup>
import { ref } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";

const isActive = ref(false);
const props = defineProps({
  label: String,
  placeholder: Object,
  data: Array,
  classes: {
    type: String,
    default: "py-1.5"
  }
});
const emit = defineEmits(['update']);

function handleOption(item) {
  if (typeof item === "object" && item !== null) {
    emit('update', item);
    isActive.value = false;
  } else {
    console.error("Xato", item);
  }
}
</script>

<template>
  <div class="relative mb-2">
    <label class="mb-2 block text-sm font-bold text-[#718EBF]" for="username">
      {{ props.label }}
    </label>
    <div>
      <button type="button" @click="isActive = !isActive"
        class="focus:ring-main relative w-full cursor-pointer rounded-md bg-white pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none text-base"
        aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label" :class="props.classes">
        <span class="flex w-full items-center justify-between">
          <span class="block truncate text-base text-[#8BA3CB]">{{
            props.placeholder.name
          }}</span>
          <ChevronDownIcon class="relative -right-6 h-4 w-4 text-[#8BA3CB] transition duration-300 ease-linear"
            :class="isActive ? 'rotate-180 transform' : ''" />
        </span>
      </button>
      <ul v-show="isActive"
        class="absolute z-20 mt-1 h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
        <li
          class="group relative cursor-default select-none py-1 pl-3 pr-9 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA]"
          v-for="item in props.data" :key="item.code" @click="handleOption(item)">
          <div class="flex cursor-pointer items-center">
            <span class="group-hover:text-main block truncate font-normal text-[#8BA3CB] transition ease-linear">{{
              item.name }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
