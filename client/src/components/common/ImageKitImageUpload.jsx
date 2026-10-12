import { useState } from "react";
import { Image, upload } from "@imagekit/react";
import api from "../../api/axios.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageKitImageUpload({
  value = "",
  onChange,
  folder = "/ecommerce",
  label = "Upload image",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  async function handleFileChange(event) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    setError("");
    setProgress(0);
    setIsUploading(true);

    try {
      // Get secure upload credentials from your Express backend.
      const response = await api.get("/uploads/imagekit-auth");
      const auth = response.data.data;

      if (
        !auth?.token ||
        !auth?.signature ||
        !auth?.expire ||
        !auth?.publicKey
      ) {
        throw new Error(
          "The backend returned incomplete ImageKit credentials.",
        );
      }

      // Upload using the React SDK.
      const result = await upload({
        file,
        fileName: file.name,
        folder,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
        publicKey: auth.publicKey,
        useUniqueFileName: true,
        onProgress: (event) => {
          if (event.total > 0) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      if (!result.url) {
        throw new Error("ImageKit did not return an image URL.");
      }

      onChange(result.url);
      setProgress(100);
    } catch (err) {
      console.error("ImageKit upload error:", err);
      console.error("ImageKit response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Image upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>

      {value && (
        <Image
          src={value}
          alt={label}
          width={160}
          height={160}
          loading="eager"
          className="h-32 w-32 rounded-lg border object-cover"
        />
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm"
      />

      {isUploading && (
        <div className="space-y-1">
          <p className="text-sm text-blue-600">
            Uploading image... {progress}%
          </p>
          <progress value={progress} max={100} className="w-full" />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
