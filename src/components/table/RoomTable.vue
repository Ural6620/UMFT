<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/solid';
const props = defineProps({
  columns: Array,
  data: Array,
  page: Number,
  limit: Number
});
const emit = defineEmits(["delete", "edite", "main"]);
function handleDelete(item) {
  emit("delete", item._id);
}
function handleEdite(item) {
  emit("edite", item._id);
}

function handleMain(item) {
  emit("main", item._id);
}
</script>
<template>
  <table class="relative w-full space-x-10 overflow-hidden  text-left transition-all duration-1000 ease-linear">
    <thead class="sticky top-0 font-medium text-[#718EBF]">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        :key="item._id" @click="handleMain(item)">
        <td class="pl-6">{{ (props.page - 1) * limit + index + 1 }}</td>
        <td class="px-6 py-1">{{ item.title }}</td>
        <td class="px-6 py-1">{{ item.number }}</td>
        <td class="px-6 py-1">{{ item.filial?.title }}</td>
        <td class="px-6 py-1">{{ item.type === 1 ? "Ўқув хонаси" : "Маиший хона" }}</td>
        <td class="px-6 py-1">{{ item.status === 1 ? "Фаол" : "Фаол эмас" }}</td>
        <td class="py-1 flex items-center gap-4 justify-end px-4">
          <button
            class="h-[30px] p-2 bg-blue-100 hover:bg-blue-300 rounded justify-center items-center gap-1 inline-flex"
            @click.stop="handleEdite(item)">
            <div class="w-3.5 h-3.5 relative">
              <PencilSquareIcon class="text-blue-600" />
            </div>
          </button>
          <button @click.stop="handleDelete(item)"
            class="h-[30px] p-2 bg-red-100 hover:bg-red-300 rounded justify-center items-center gap-1 inline-flex">
            <div class="w-3.5 h-3.5 relative">
              <TrashIcon class="text-red-600" />
            </div>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
