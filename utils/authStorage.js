import AsyncStorage from "@react-native-async-storage/async-storage";

/* Guardar ambos tokens */
export const saveToken = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
};

/* Obtener access token (el que usa axios) */
export const getToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};

/* Obtener refresh token */
export const getRefreshToken = async () => {
  return await AsyncStorage.getItem("refreshToken");
};

/* Borrar sesión completa */
export const removeToken = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
};
