import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const createUploader = (subfolder: string) => {
  const uploadDir = path.join(process.cwd(), "uploads", subfolder);
  ensureDir(uploadDir);

  const storage: StorageEngine = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  });

  return multer({ storage });
};
