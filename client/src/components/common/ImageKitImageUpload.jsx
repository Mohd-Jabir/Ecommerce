
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
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
      </label>

      {value && (
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <Image
            src={value}
            alt={label}
            width={160}
            height={160}
            loading="eager"
            className="h-32 w-32 rounded-md object-cover"
          />
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-orange-400 hover:bg-orange-50/40">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white file:transition-colors hover:file:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-3 text-xs leading-5 text-gray-500">
          JPG, PNG, or WebP · Maximum file size: 5 MB
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">
              Uploading image...
            </p>
            <span className="text-sm font-semibold tabular-nums text-orange-600">
              {progress}%
            </span>
          </div>

          <progress
            value={progress}
            max={100}
            className="h-2 w-full overflow-hidden rounded-full accent-orange-500"
          />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
