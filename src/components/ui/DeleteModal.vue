<script setup>
const props = defineProps({
  show: Boolean,
});
</script>

<template>
  <Transition name="modal">
    <div v-if="show"
      class="fixed z-50 top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] transition-all duration-300 ease-in flex">
      <div
        class="modal-container flex flex-col items-center w-5/6 lg:w-1/5 m-auto px-5 py-8 bg-red-50 rounded-2xl transition-all duration-300 ease-in shadow-[0_2px_8px_rgba(0,0,0,0.33)]">
        <div class="modal-header text-lg pb-3">
          <slot/>
        </div>

        <div class="w-full flex flex-col items-center gap-2 pt-4">
          <button class="w-full bg-blue-100 text-blue-600 hover:bg-blue-300 transition-all ease-linear rounded-md py-1"
            @click="$emit('close')">
            Бекор қилиш
          </button>
          <button class="w-full bg-red-100 text-red-600 hover:bg-red-300 transition-all ease-linear rounded-md py-1"
            @click="$emit('delete')">
            Ўчириш
          </button>
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