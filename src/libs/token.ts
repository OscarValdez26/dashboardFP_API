import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET_KEY = process.env.SECRET_KEY || "";
const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY || "";

export const generarAccessToken = (data: object) => {
  const accessToken = jwt.sign(data, SECRET_KEY, { expiresIn: "15m" });
  return accessToken;
};

export const generarRefreshToken = (data: object) => {
  const refreshToken = jwt.sign(data, SECRET_REFRESH_KEY, { expiresIn: "7d" });
  return refreshToken;
};

export const validarAccessToken = (token: string) => {
  try {
    const decode = jwt.verify(token, SECRET_KEY);
    return { success: true, result: decode };
  } catch (err: any) {
    return { success: false, result: err.message };
  }
};

export const validarRefreshToken = (token: string) => {
  try {
    const decode = jwt.verify(token, SECRET_REFRESH_KEY);
    return { success: true, result: decode };
  } catch (err: any) {
    return { success: false, result: err.message };
  }
};
