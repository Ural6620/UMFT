<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
const props = defineProps({
  columns: Array,
  data: Array,
  page: Number,
  limit: Number,
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
  <table
    class="relative w-full space-x-10 overflow-hidden text-left transition-all duration-1000 ease-linear"
  >
    <thead class="sticky top-0 font-medium text-[#718EBF]">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        class="cursor-pointer border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]"
        v-for="(item, index) in data"
        :key="item._id"
        @click="handleMain(item)"
      >
        <td class="pl-6">{{ (props.page - 1) * limit + index + 1 }}</td>
        <td class="px-6 py-1">{{ item.title }}</td>
        <td class="px-6 py-1">{{ item.number }}</td>
        <td class="px-6 py-1">{{ item.filial?.title }}</td>
        <td class="px-6 py-1">
          {{ item.type === 1 ? "Ўқув хонаси" : "Маиший хона" }}
        </td>
        <td class="px-6 py-1">
          {{ item.status === 1 ? "Фаол" : "Фаол эмас" }}
        </td>
        <td class="flex items-center justify-end gap-4 px-4 py-1">
          <button
            class="inline-flex h-[30px] items-center justify-center gap-1 rounded bg-blue-100 p-2 hover:bg-blue-300"
            @click.stop="handleEdite(item)"
          >
            <div class="relative h-3.5 w-3.5">
              <PencilSquareIcon class="text-blue-600" />
            </div>
          </button>
          <button
            @click.stop="handleDelete(item)"
            class="inline-flex h-[30px] items-center justify-center gap-1 rounded bg-red-100 p-2 hover:bg-red-300"
          >
            <div class="relative h-3.5 w-3.5">
              <TrashIcon class="text-red-600" />
            </div>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
