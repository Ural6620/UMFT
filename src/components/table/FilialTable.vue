<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  columns: Array,
  data: Array,
  page: Number,
  limit: Number
});

const emit = defineEmits(["delete", "edite"]);

function handleDelete(item) {
  emit("delete", item._id);
}

function handleEdite(item) {
  emit("edite", item._id)
}
</script>
<template>
  <table class="relative max-h-96 w-full space-x-10 overflow-hidden text-left">
    <thead class="sticky top-0 bg-white text-[#718EBF]">
      <tr>
        <th scope="col" class="px-2 lg:px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]"
        v-for="(item, index) in data">
        <td class="pl-2 lg:pl-6 py-2">{{ (props.page - 1) * props.limit + index + 1 }}</td>
        <td class="px-2 lg:px-6 py-2">
          <img class="w-12 h-12 rounded-xl" :src="`http://195.158.9.124:4101/${item.img}`" alt="filial image">
        </td>
        <td class="px-2 lg:px-6 py-2">{{ item.title }}</td>
        <td class="px-2 lg:px-6 py-2">{{ item.number }}</td>
        <td class="px-2 lg:px-6 py-2 ">{{ item.address }}</td>
        <td class="px-2 lg:px-6 py-2">{{ item.status === 1 ? 'Фаол' : 'Фаол емас' }}</td>
        <td class="px-4 py-2">
          <div class=" flex items-center gap-4 justify-end">
            <button
              class="h-[30px] p-2 bg-blue-100 hover:bg-blue-300 rounded justify-center items-center gap-1 inline-flex"
              @click="handleEdite(item)">
              <div class="w-3.5 h-3.5 relative">
                <PencilSquareIcon class="text-blue-600" />
              </div>
            </button>
            <button @click="handleDelete(item)"
              class="h-[30px] p-2 bg-red-100 hover:bg-red-300 rounded justify-center items-center gap-1 inline-flex">
              <div class="w-3.5 h-3.5 relative">
                <TrashIcon class="text-red-600" />
              </div>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
