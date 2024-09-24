import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";

export const useQrCodeStore = defineStore("qrCode", () => {
  const qrCodes = ref([]);
  const qrcodesRoom = ref([]);
  const count = ref(null);
  const qrcodeById = ref(null);
  const summa = ref(null);

  const getAll = async (limit = 15, page = "", product = "", room = "", employeenull = "", invoice = "", employee = "", category = '') => {
    const response = await api.get(
      `/code?limit=${limit}&page=${page}&product=${product}&room=${room}&employeenull=${employeenull}&invoice=${invoice}&employee=${employee}&categoryinventor=${category}`,
    );
    qrCodes.value = response.data.data;
    count.value = response.data.count;
    summa.value = response.data.summa;
  };

  const getAllRooms = async (limit = 15, page = "", title = "") => {
    const response = await api.get(
      `/code/allroom?limit=${limit}&page=${page}&title=${title}`,
    );
    qrCodes.value = response.data;
    console.log(response.data);
    count.value = response.data.count;
  };

  const getQrCodeById = async (id) => {
    const response = await api.get(`/code/show/${id}`);
    qrcodeById.value = response.data;
    console.log(response.data);
  };

  return {
    qrCodes,
    qrcodesRoom,
    count,
    summa,
    qrcodeById,
    getAll,
    getAllRooms,
    getQrCodeById,
  };
})