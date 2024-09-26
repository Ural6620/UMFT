<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon } from "@heroicons/vue/24/solid";
import BaseButton from "../ui/BaseButton.vue";

const props = defineProps({
  columns: Array,
  data: Array,
  page: [Number, String],
  limit: Number,
});

const emit = defineEmits(["edite", "main"]);

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
        <th scope="col" class="px-6 py-4 truncate" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="cursor-pointer border-t bg-white hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        @click="handleMain(item)">
        <td class="truncate py-2 pl-6">
          {{ (page - 1) * limit + (index + 1) }}
        </td>
        <td class="p-2 lg:px-6">
          <img class="h-12 w-12 rounded-md object-cover" :src="`${item.image}`" alt="employee image" />
        </td>
        <td class="truncate px-6 py-2">{{ item.full_name }}</td>
        <td class="truncate px-6 py-2">{{ item.department?.name }}</td>
        <td class="truncate px-6 py-2">{{ item.academicRank?.name }}</td>
        <td class="truncate px-6 py-2">{{ item.employeeType?.name }}</td>
        <td class="px-4 py-2">
          <div class="flex items-center justify-end gap-4">
            <BaseButton @click.stop="handleEdite(item)" color="blue">
              <PencilSquareIcon class="w-3.5 h-3.5" />
            </BaseButton>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
