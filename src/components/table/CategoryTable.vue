<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
import BaseButton from "../ui/BaseButton.vue";
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
  <table class="relative w-full text-left">
    <thead class="sticky top-0 bg-white font-medium text-[#718EBF] z-10">
      <tr>
        <th scope="col" class="px-6 py-3 truncate" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="cursor-pointer border-t bg-white hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        @click="handleMain(item)">
        <td class="py-2 pl-6">{{ (props.page - 1) * limit + index + 1 }}</td>
        <td class="py-2 pl-6">
          <img class="h-12 w-12 rounded-xl" :src="`http://195.158.9.124:4101/${item.img}`" alt="category image" />
        </td>
        <td class="px-6 py-2 truncate">{{ item.title }}</td>
        <td class="px-6 py-2">{{ item.products }}</td>
        <td class="px-6 py-2">{{ item.codes }}</td>
        <td class="px-6 py-2 truncate">
          {{ item.status === 1 ? "Фаол" : "Фаол емас" }}
        </td>
        <td class="px-4 py-2">
          <div class="flex items-center justify-end gap-4">
            <BaseButton @click.stop="handleEdite(item)" color="blue">
              <PencilSquareIcon class="relative h-3.5 w-3.5" />
            </BaseButton>
            <BaseButton @click.stop="handleDelete(item)" color="red">
              <TrashIcon class="relative h-3.5 w-3.5" />
            </BaseButton>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
