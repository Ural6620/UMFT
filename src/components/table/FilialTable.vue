<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
import BaseButton from "../ui/BaseButton.vue";
import api from "@/plugins/axios";


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
    <thead class="sticky top-0 bg-white text-[#718EBF] z-10">
      <tr>
        <th scope="col" class="p-2 lg:px-6" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="cursor-pointer border-t bg-white hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        @click="handleMain(item)">
        <td class="p-2 lg:px-6">
          {{ (props.page - 1) * props.limit + index + 1 }}
        </td>
        <td class="p-2 lg:px-6">
          <img class="h-12 w-12 rounded-xl object-fill" :src="`${api.defaults.baseURL}/${item.img}`"
            alt="filial image" />
        </td>
        <td class="p-2 lg:px-6">{{ item.title }}</td>
        <td class="p-2 lg:px-6">{{ item.number }}</td>
        <td class="p-2 lg:px-6 truncate">{{ item.address }}</td>
        <td class="p-2 lg:px-6 truncate">
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
