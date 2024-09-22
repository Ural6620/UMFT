<script setup>
defineProps({
  color: String
})
</script>
<template>
  <button
    :class="`rounded-md p-2 flex justify-center items-center text-${color}-600 bg-${color}-100 hover:bg-${color}-300`">
    <slot />
  </button>
</template>
