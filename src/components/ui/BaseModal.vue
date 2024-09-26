<script setup>
import BaseButton from './BaseButton.vue';

const props = defineProps({
  show: Boolean,
});
</script>

<template>
  <Transition name="modal">
    <div v-if="show"
      class="fixed z-50 top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] transition-all duration-300 ease-in flex">
      <div
        class="modal-container w-11/12 lg:w-1/2 m-auto px-5 py-8 bg-white rounded-2xl transition-all duration-300 ease-in shadow-[0_2px_8px_rgba(0,0,0,0.33)] divide-y">
        <div class="modal-header text-xl pb-3 text-main flex justify-between">
          <slot name="header">default header</slot>
        </div>

        <div class="modal-body py-4">
          <slot name="body" />
        </div>

        <div class="w-full flex justify-end gap-2 pt-4">
          <BaseButton class="w-32" @click="$emit('close')">
            Бекор қилиш
          </BaseButton>
          <slot name="button" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
