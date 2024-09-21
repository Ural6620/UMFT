<script setup>
import { defineProps, defineEmits, computed } from "vue";
import { ArrowDownOnSquareIcon, EyeIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  columns: Array,
  data: Array,
  page: Number,
  limit: Number,
  count: Number,
  summa: Number
});

const emit = defineEmits(["download", "showQr"]);

function downloadFile(item) {
  emit("download", item._id);
}

function showFile(item) {
  emit("showQr", item._id);
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
        v-for="(item, index) in data">
        <td class="pl-6 py-2">{{ (page - 1) * limit + (index + 1) }}</td>
        <td class="px-6 py-2 truncate">{{ item.product?.title ? item.product?.title : 'Маҳсулот бириктирилмаган' }}</td>
        <td class="px-6 py-2 truncate">{{ item.product?.model ? item.product?.model : 'Модел бириктирилмаган' }}</td>
        <td class="px-6 py-2 truncate">{{ item.invoice?.title }}</td>
        <td class="px-6 py-2 truncate">{{ item.room ? item.room?.number : 'Хона бириктирилмаган' }}</td>
        <td class="px-6 py-2 truncate">{{ item.employee ? item.employee?.full_name : 'Ходим бириктирилмаган' }}</td>
        <td class="px-6 py-2 truncate">{{ item.price.toLocaleString() + ' сум' }}</td>
        <td class="px-4 py-2">
          <div class=" flex items-center gap-4 justify-end">
            <button @click.prevent="downloadFile(item)"
              class="p-2 transition ease-linear bg-yellow-100 hover:bg-yellow-300 rounded justify-center items-center gap-1 inline-flex">
              <ArrowDownOnSquareIcon class="text-yellow-600 w-3.5 h-3.5" />
            </button>
            <button @click.prevent="showFile(item)"
              class="p-2 transition ease-linear bg-blue-100 hover:bg-blue-300 rounded justify-center items-center gap-1 inline-flex">
              <EyeIcon class="text-blue-600 w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="(page - 1) * limit + data.length === count" class="px-10">
      <tr>
        <td colspan="8" class="px-6 py-3">Жами: {{ summa.toLocaleString() + ' сум' }}</td>
      </tr>
    </tfoot>
  </table>
</template>
