<script setup>
import { defineProps, defineEmits, reactive } from "vue";
import { ArrowDownOnSquareIcon, EyeIcon, TrashIcon } from "@heroicons/vue/24/solid";
import { useQrCodeStore } from "@/stores/qrCode";
import BaseButton from "../ui/BaseButton.vue";

const qrCodeStore = useQrCodeStore();
const form = reactive({
  _id: '',
  employee: null,
  room: '',
  price: 0,
  invoice: '',
  product: ''
})
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

async function deleteEmployee(item) {
  form._id = item._id;
  form.employee = null;
  form.room = item.room?._id;
  form.price = item.price;
  form.invoice = item.invoice?._id;
  form.product = item.product?._id;
  await qrCodeStore.updateQrCode(form);
  emit("reload");
}
</script>
<template>
  <table class="relative w-full text-left text-base">
    <thead class="sticky top-0 bg-white font-medium text-[#718EBF] z-10">
      <tr>
        <th scope="col" class="px-6 py-4" v-for="column in columns">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t bg-white transition duration-300 ease-in-out hover:bg-[#f5f5f5]"
        v-for="(item, index) in data">
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
            <BaseButton @click="downloadFile(item)" color="yellow">
              <ArrowDownOnSquareIcon class="h-3.5 w-3.5" />
            </BaseButton>
            <BaseButton @click="showFile(item)" color="blue">
              <EyeIcon class="h-3.5 w-3.5" />
            </BaseButton>
            <BaseButton @click="deleteEmployee(item)" color="red">
              <TrashIcon class="h-3.5 w-3.5" />
            </BaseButton>
          </div>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="(page - 1) * limit + data.length === count">
      <tr>
        <td colspan="8" class="px-6 py-2 text-main text-lg font-semibold border-main border-t mt-10">
          Жами: {{ summa.toLocaleString() + " сум" }}
        </td>
      </tr>
    </tfoot>
  </table>
</template>
