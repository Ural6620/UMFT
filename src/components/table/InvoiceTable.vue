<script setup>
import { defineProps, defineEmits } from "vue";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowDownOnSquareStackIcon,
} from "@heroicons/vue/24/solid";
import BaseButton from "../ui/BaseButton.vue";
const props = defineProps({
  columns: Array,
  data: Array,
  limit: Number,
  page: Number,
});
const emit = defineEmits(["delete", "edite", "download", "main"]);

function handleDelete(item) {
  emit("delete", item._id);
}

function handleEdite(item) {
  emit("edite", item._id);
}

function handleDownload(item) {
  emit("download", item._id);
}

function handleMain(item) {
  emit("main", item._id);
}
</script>
<template>
  <table class="relative w-full text-left">
    <thead class="sticky top-0 bg-white font-medium text-[#718EBF] z-10">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="cursor-pointer border-t bg-white hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        @click="handleMain(item)">
        <td class="py-2 pl-6">{{ (page - 1) * limit + (index + 1) }}</td>
        <td class="px-6 py-2">{{ item.title }}</td>
        <td class="px-6 py-2">{{ item.description }}</td>
        <td class="px-6 py-2">{{ item.count }}</td>
        <td class="px-6 py-2">{{ item.summa.toLocaleString() + " сум" }}</td>
        <td class="px-6 py-2">
          {{ item.status === 1 ? "Фаол" : "Фаол эмас" }}
        </td>
        <td class="px-6 py-2">{{ item.file?.length }}</td>
        <td class="px-4 py-2">
          <div class="flex items-center justify-end gap-4">
            <BaseButton @click.stop="handleDownload(item)" color="yellow">
              <ArrowDownOnSquareStackIcon class="relative h-3.5 w-3.5" />
            </BaseButton>
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
