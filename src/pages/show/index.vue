<script setup>
import { useRoute } from 'vue-router';
import { useQrCodeStore } from '@/stores/qrCode';
import { onMounted } from 'vue';
import api from '@/plugins/axios';
const route = useRoute();
const qrCodeStore = useQrCodeStore();
const id = route.params.id
onMounted(async () => {
  await qrCodeStore.getQrCodeById(id);
})
</script>
<template>

  <div class="bg-main flex min-h-screen w-screen items-center justify-center">
    <div class="flex flex-col gap-4 text-black w-96 border p-4 m-10 rounded-xl h-fit text-xl bg-white">
      <h4 class="text-center text-2xl font-bold">Товар ҳақида маълумот</h4>
      <div class="flex justify-center items-center p-10 bg-gray-200 rounded-xl">
        <img class=" w-40 h-40 " :src="`${api.defaults.baseURL}/${qrCodeStore?.qrcodeById?.product?.img}`"
          alt="Продустга расм бириктирилмаган" />
      </div>
      <div>
        <div class="font-semibold">
          <p class="text-gray-500">Номи: <span class="text-black font-bold">
              {{ qrCodeStore?.qrcodeById?.product?.title }}
            </span>
          </p>
          <p class="text-gray-500">Филиал: <span class="text-black">{{ qrCodeStore?.qrcodeById?.room ?
            qrCodeStore?.qrcodeById?.room?.filial?.title :
            `Ҳали бириктирилмаган`
              }}</span></p>
          <p class="text-gray-500">Хона рақами: <span class="text-black">{{ qrCodeStore?.qrcodeById?.room ?
            qrCodeStore?.qrcodeById?.room?.number :
            `Ҳали бириктирилмаган`
              }}</span></p>
          <p class="text-gray-500">Фактура рақами: <span class="text-black">{{ qrCodeStore?.qrcodeById?.invoice?.title
              }}</span></p>

          <p class="text-black mt-2 text-center text-2xl font-bold">Ходим:</p>
          <p class="text-gray-500">ФИО: <span class="text-black">{{ qrCodeStore?.qrcodeById?.employee ?
            qrCodeStore?.qrcodeById?.employee?.full_name
            : `Ходим бириктирилмаган` }}</span>
          </p>
          <div class="flex justify-between  ">
            <p class="text-gray-500">Расми: </p>
            <img class="rounded-xl h-40 w-40 " :src="`${qrCodeStore?.qrcodeById?.employee?.image}`" alt="Ходим расми" />
          </div>
        </div>
      </div>
    </div>
  </div>

</template>