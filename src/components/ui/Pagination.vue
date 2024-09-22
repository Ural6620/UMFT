<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
defineProps({
  limit: Number,
  data: Object,
  page: Number,
})

const emit = defineEmits(["goPage", "next", "prew"]);
function goPage(n) {
  emit("goPage", n);
}
</script>
<template>
  <div class="text-main flex w-full items-center justify-end gap-2 px-10 py-2">
    <span class="flex cursor-pointer items-center" @click="$emit('prew')">
      <ChevronLeftIcon class="h-4 w-4" />
    </span>
    <span v-if="page > 2" class="cursor-pointer rounded-md px-2 transition-all ease-linear"
      :class="1 === page ? 'bg-main text-white' : ''" @click="goPage(1)">
      {{ 1 }}
    </span>
    <span v-if="page > 2">...</span>
    <span v-if="page > 1" class="cursor-pointer rounded-md px-2 transition-all ease-linear" @click="goPage(page - 1)">
      {{ page - 1 }}
    </span>
    <span class="bg-main cursor-pointer rounded-md px-2 text-white transition-all ease-linear" @click="goPage(page)">
      {{ page }}
    </span>
    <span v-if="page < Math.ceil(data.count / limit) - 1"
      class="cursor-pointer rounded-md px-2 transition-all ease-linear" @click="goPage(page + 1)">
      {{ Number(page) + 1 }}
    </span>
    <span v-if="page < Math.ceil(data.count / limit) - 1">...</span>
    <span class="cursor-pointer rounded-md px-2 transition-all ease-linear" v-if="Math.ceil(data.count / limit) > page"
      :class="Math.ceil(data.count / limit) === page
        ? 'bg-main text-white'
        : ''
        " @click="goPage(Math.ceil(data.count / limit))">
      {{ Math.ceil(data.count / limit) }}
    </span>
    <span class="flex cursor-pointer items-center gap-1" @click="$emit('next')">
      <ChevronRightIcon class="h-4 w-4" />
    </span>
  </div>
</template>