import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";

export const useRoomStore = defineStore("room", () => {
  const rooms = ref([]);
  const count = ref(null);
  const roomById = ref(null);

  const get = async (limit = 15, page = "", title = "", filial = "", number = "") => {
    const response = await api.get(
      `/crud/room?limit=${limit}&page=${page}&title=${title}&filial=${filial}&number=${number}`,
    );
    rooms.value = response.data.data;
    count.value = response.data.count;
  };

  const addRoom = async (data) => {
    await api.post("/crud/room", data);
  };

  const updateRoom = async (data) => {
    await api.put("/crud/room", data);
  };

  const deleteRoom = async (id) => {
    await api.delete(`/crud/room/${id}`);
  };

  const getRoomById = async (id) => {
    const response = await api.get(`/crud/room/${id}`);
    roomById.value = response.data;
  };

  return {
    rooms,
    count,
    roomById,
    get,
    addRoom,
    updateRoom,
    deleteRoom,
    getRoomById,
  };
});
