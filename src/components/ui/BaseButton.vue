<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: String,
  classes: String
});

const colorClasses = computed(() => {
  switch (props.color) {
    case 'green':
      return 'text-emerald-600 bg-emerald-100 hover:bg-emerald-300';
    case 'orange':
      return 'text-orange-600 bg-orange-100 hover:bg-orange-300';
    case 'blue':
      return 'text-blue-600 bg-blue-100 hover:bg-blue-300';
    case 'red':
      return 'text-red-600 bg-red-100 hover:bg-red-300';
    case 'yellow':
      return 'text-yellow-600 bg-yellow-100 hover:bg-yellow-300';
    case 'main':
      return 'text-main';
    default:
      return 'text-gray-600 bg-gray-100 hover:bg-gray-300'; // Default rang
  }
});
</script>

<template>
  <button :class="`rounded-md p-2 flex justify-center items-center ${colorClasses} ${props.classes}`">
    <slot />
  </button>
</template>
