<script setup>
import { defineProps, defineEmits } from "vue";
import { PencilSquareIcon } from '@heroicons/vue/24/solid';


const props = defineProps({
  columns: Array,
  data: Array,
  page: [Number, String],
  limit: Number
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
  <table class="relative max-h-96 w-full space-x-10 overflow-hidden text-left">
    <thead class="sticky top-0 bg-white font-medium text-[#718EBF]">
      <tr>
        <th scope="col" class="px-6 py-3" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]" v-for="(item, index) in data"
        @click="handleMain(item)">
        <td class="pl-6 py-2 truncate">{{ (page - 1) * limit + (index + 1) }}</td>
        <td class="px-6 py-2 truncate">{{ item.full_name }}</td>
        <td class="px-6 py-2 truncate">{{ item.department?.name }}</td>
        <td class="px-6 py-2 truncate">{{ item.academicRank?.name }}</td>
        <td class="px-6 py-2 truncate">{{ item.employeeType?.name }}</td>
        <td class="px-4 py-2">
          <div class=" flex items-center gap-4 justify-end">
            <button
              class="h-[30px] p-2 bg-blue-100 hover:bg-blue-300 rounded justify-center items-center gap-1 inline-flex"
              @click.stop="handleEdite(item)">
              <div class="w-3.5 h-3.5 relative">
                <PencilSquareIcon class="text-blue-600" />
              </div>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
