<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon } from "@heroicons/vue/24/solid";

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
  <table class="relative w-full flex-1 space-x-10 overflow-auto text-left">
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
        @click="handleMain(item)"
      >
        <td class="truncate py-2 pl-6">
          {{ (page - 1) * limit + (index + 1) }}
        </td>
        <td class="truncate px-6 py-2">{{ item.full_name }}</td>
        <td class="truncate px-6 py-2">{{ item.department?.name }}</td>
        <td class="truncate px-6 py-2">{{ item.academicRank?.name }}</td>
        <td class="truncate px-6 py-2">{{ item.employeeType?.name }}</td>
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
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
