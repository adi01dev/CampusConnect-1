import jwt from "jsonwebtoken";

const SECRET = process.env.QR_SECRET || "supersecure_qr_secret";

export const generateQRToken = (payload: any, expiresIn: string | number = "5m") => {
  return jwt.sign(payload, SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

export const verifyQRToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
