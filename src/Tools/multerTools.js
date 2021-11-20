import multer from "multer";
import cloudinary from "./cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "web-develop-profile",
  },
});
export const imageUpload = multer({ storage: cloudinaryStorage });