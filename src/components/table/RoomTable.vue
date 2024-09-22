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
    <thead class="sticky top-0 font-medium text-[#718EBF] z-10">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="cursor-pointer border-t bg-white  hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        @click="handleMain(item)">
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
          <BaseButton @click.stop="handleEdite(item)" color="blue">
            <PencilSquareIcon class="w-3.5 h-3.5" />
          </BaseButton>
          <BaseButton @click.stop="handleDelete(item)" color="red">
            <TrashIcon class="w-3.5 h-3.5" />
          </BaseButton>
        </td>
      </tr>
    </tbody>
  </table>
</template>
