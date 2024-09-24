<script setup>
import { useRoute } from 'vue-router';
import { useQrCodeStore } from '@/stores/qrCode';
import { onMounted } from 'vue';
const route = useRoute();
const qrCodeStore = useQrCodeStore();
const id = route.params.id
onMounted(async () => {
  await qrCodeStore.getQrCodeById(id);
})
</script>
<template>

  <div class="bg-main flex h-screen w-screen  justify-center">
    <div class="flex flex-col gap-4 text-white border p-10 m-10 rounded-xl h-fit text-xl">
      <h1>Id: {{ id }}</h1>
      <p>Продукт номи: {{ qrCodeStore?.qrcodeById?.product?.title }}</p>
      <p>Продукт модели: {{ qrCodeStore?.qrcodeById?.product?.model }}</p>
      <p>Продукт маълумоми: {{ qrCodeStore?.qrcodeById?.product?.text }}</p>
      <p>Фактура рақами: {{ qrCodeStore?.qrcodeById?.invoice?.title }}</p>
      <p>Хона рақами: {{ qrCodeStore?.qrcodeById?.room ? qrCodeStore?.qrcodeById?.room?.number : 'Ҳали бириктирилмаган'
        }}
      </p>
      <p>Ходим: {{ qrCodeStore?.qrcodeById?.employee ? qrCodeStore?.qrcodeById?.employee?.full_name :
        'Ҳали бириктирилмаган' }}</p>

    </div>
  </div>

</template>