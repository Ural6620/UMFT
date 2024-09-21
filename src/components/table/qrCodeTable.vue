<script setup>
import { defineProps, defineEmits, computed } from "vue";
import { ArrowDownOnSquareIcon, EyeIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  columns: Array,
  data: Array,
  page: Number,
  limit: Number,
  count: Number,
  summa: Number,
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
      <tr
        class="border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]"
        v-for="(item, index) in data"
      >
        <td class="py-2 pl-6">{{ (page - 1) * limit + (index + 1) }}</td>
        <td class="truncate px-6 py-2">
          {{
            item.product?.title
              ? item.product?.title
              : "Маҳсулот бириктирилмаган"
          }}
        </td>
        <td class="truncate px-6 py-2">
          {{
            item.product?.model ? item.product?.model : "Модел бириктирилмаган"
          }}
        </td>
        <td class="truncate px-6 py-2">{{ item.invoice?.title }}</td>
        <td class="truncate px-6 py-2">
          {{ item.room ? item.room?.number : "Хона бириктирилмаган" }}
        </td>
        <td class="truncate px-6 py-2">
          {{
            item.employee ? item.employee?.full_name : "Ходим бириктирилмаган"
          }}
        </td>
        <td class="truncate px-6 py-2">
          {{ item.price.toLocaleString() + " сум" }}
        </td>
        <td class="px-4 py-2">
          <div class="flex items-center justify-end gap-4">
            <button
              @click.prevent="downloadFile(item)"
              class="inline-flex items-center justify-center gap-1 rounded bg-yellow-100 p-2 transition ease-linear hover:bg-yellow-300"
            >
              <ArrowDownOnSquareIcon class="h-3.5 w-3.5 text-yellow-600" />
            </button>
            <button
              @click.prevent="showFile(item)"
              class="inline-flex items-center justify-center gap-1 rounded bg-blue-100 p-2 transition ease-linear hover:bg-blue-300"
            >
              <EyeIcon class="h-3.5 w-3.5 text-blue-600" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="(page - 1) * limit + data.length === count" class="px-10">
      <tr>
        <td colspan="8" class="px-6 py-3">
          Жами: {{ summa.toLocaleString() + " сум" }}
        </td>
      </tr>
    </tfoot>
  </table>
</template>
