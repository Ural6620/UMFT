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
  <table class="relative max-h-96 w-full space-x-10 overflow-hidden text-left">
    <thead class="sticky top-0 bg-white font-medium text-[#718EBF]">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        class="cursor-pointer border-t bg-white hover:bg-[#f5f5f5]"
        v-for="(item, index) in data"
        :key="item._id"
        @click="handleMain(item)"
      >
        <td class="py-2 pl-6">{{ (page - 1) * limit + (index + 1) }}</td>
        <td class="py-2 pl-6">
          <img
            class="h-12 w-12 rounded-xl"
            :src="`http://195.158.9.124:4101/${item.img}`"
            alt="category image"
          />
        </td>
        <td class="px-6 py-2">{{ item.title }}</td>
        <td class="px-6 py-2">{{ item.categoryinventor?.title }}</td>
        <td class="px-6 py-2">{{ item.model }}</td>
        <td class="px-6 py-2">{{ item.text }}</td>
        <td class="px-6 py-2">
          {{ item.status === 1 ? "Фаол" : "Фаол емас" }}
        </td>
        <td class="px-6 py-2">{{ item.codes }}</td>
        <td class="px-6 py-2">{{ item.room_codes }}</td>
        <td class="px-4 py-2">
          <div class="flex items-center justify-end gap-4">
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
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
