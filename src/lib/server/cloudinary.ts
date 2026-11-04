import "server-only";

import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

function client() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if ((!cloudName || !apiKey || !apiSecret) && !cloudinaryUrl) throw new Error("Cloudinary n'est pas configuré.");
  if (!configured) {
    cloudinary.config(cloudinaryUrl ? { cloudinary_url: cloudinaryUrl, secure: true } : { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    configured = true;
  }
  return cloudinary;
}

export const isCloudinaryConfigured = () => Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));

/** Téléverse un document non public et renvoie son identifiant Cloudinary stable. */
export async function uploadPrivateFile(file: File, folder: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const source = `data:${file.type || "application/octet-stream"};base64,${bytes.toString("base64")}`;
  const result = await client().uploader.upload(source, {
    resource_type: "raw",
    type: "authenticated",
    folder,
    use_filename: true,
    unique_filename: true,
  });
  return result.public_id;
}

/** URL de téléchargement signée, courte durée, générée seulement après contrôle d'accès applicatif. */
export function privateDownloadUrl(publicId: string, fileName: string) {
  return client().utils.private_download_url(publicId, path.extname(fileName).slice(1), { resource_type: "raw", type: "authenticated", expires_at: Math.floor(Date.now() / 1000) + 5 * 60, attachment: true });
}
