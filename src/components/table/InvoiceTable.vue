<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon, TrashIcon, ArrowDownOnSquareStackIcon } from '@heroicons/vue/24/solid';
const props = defineProps({
  columns: Array,
  data: Array,
  limit: Number,
  page: Number
});
const emit = defineEmits(["delete", "edite", "download", "main"]);

function handleDelete(item) {
  emit("delete", item._id);
}

function handleEdite(item) {
  emit("edite", item._id)
}

function handleDownload(item) {
  emit("download", item._id)
}

function handleMain(item) {
  emit("main", item._id)
}
</script>
<template>
  <table class="relative max-h-96 w-full space-x-10 overflow-hidden text-left">
    <thead class="sticky top-0 bg-white font-medium text-[#718EBF]">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]"
        v-for="(item, index ) in data" @click="handleMain(item)">
        <td class="pl-6 py-2">{{ (page - 1) * limit + (index + 1) }}</td>
        <td class="px-6 py-2">{{ item.title }}</td>
        <td class="px-6 py-2">{{ item.description }}</td>
        <td class="px-6 py-2">{{ item.count }}</td>
        <td class="px-6 py-2">{{ item.summa.toLocaleString() + ' сум' }}</td>
        <td class="px-6 py-2">{{ item.status === 1 ? 'Фаол' : 'Фаол эмас' }}</td>
        <td class="px-6 py-2">{{ item.file?.length }}</td>
        <td class="px-4 py-2">
          <div class=" flex items-center gap-4 justify-end">
            <button
              class="h-[30px] p-2 transition ease-linear bg-yellow-100 hover:bg-yellow-300 rounded justify-center items-center gap-1 inline-flex"
              @click.stop="handleDownload(item)">
              <div class="w-3.5 h-3.5 relative">
                <ArrowDownOnSquareStackIcon class="text-yellow-600" />
              </div>
            </button>
            <button
              class="h-[30px] p-2 transition ease-linear bg-blue-100 hover:bg-blue-300 rounded justify-center items-center gap-1 inline-flex"
              @click.stop="handleEdite(item)">
              <div class="w-3.5 h-3.5 relative">
                <PencilSquareIcon class="text-blue-600" />
              </div>
            </button>
            <button @click.stop="handleDelete(item)"
              class="h-[30px] p-2 transition ease-linear bg-red-100 hover:bg-red-300 rounded justify-center items-center gap-1 inline-flex">
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
