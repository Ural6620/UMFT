<script setup>
import { ref } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/solid';
const isActive = ref(false)
const props = defineProps({
  label: String,
  placeholder: String,
  data: Array,
  classes: String
})
const emit = defineEmits(["update:modelValue"])
const select = ref(props.placeholder)

function handleOption(item) {
  if (typeof item === 'object' && item !== null) {
    select.value = item.title;
    isActive.value = false;
    emit('update:modelValue', item._id);
  } else {
    console.error('Xato', item);
  }
}
</script>

<template>
  <div class="relative mb-3 " :class="classes">
    <label class="mb-2 block text-sm font-bold text-[#718EBF]" for="username">
      {{ props.label }}
    </label>
    <div>
      <button type="button" @click="isActive = !isActive"
        class="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-6 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-[#1814F3] sm:text-sm sm:leading-6"
        aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
        <span class="flex items-center justify-between">
          <span class="text-base block truncate text-[#8BA3CB]">{{ select }}</span>
          <ChevronDownIcon class="w-4 h-4 text-[#8BA3CB] transition ease-linear duration-300 relative -right-6"
            :class="isActive ? 'transform rotate-180' : ''" />
        </span>
      </button>
      <ul v-show="isActive"
        class="absolute z-20 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg  ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
        <li
          class="relative cursor-default select-none pl-3 py-1 pr-9 text-gray-900 transition-all ease-linear hover:bg-[#F5F7FA] group"
          id="listbox-option-0" role="option" v-for="item in data" @click="handleOption(item)">
          <div class="flex items-center cursor-pointer">
            <span
              class="ml-3 block truncate font-normal transition ease-linear text-[#8BA3CB] group-hover:text-[#1814F3]">{{
                item.title }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>