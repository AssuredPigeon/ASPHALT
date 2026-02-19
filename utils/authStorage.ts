import AsyncStorage from "@react-native-async-storage/async-storage";

/* Guardar ambos tokens */
export const saveToken = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
};

/* Obtener access token */
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("accessToken");
};

/* Obtener refresh token */
export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("refreshToken");
};

/* Borrar sesión */
export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
};
