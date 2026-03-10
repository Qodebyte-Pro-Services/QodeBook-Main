"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { LiaCloudUploadAltSolid } from "react-icons/lia";

// Type definitions
interface DropZoneProps {
  file?: File | null;
  setFile: (setter: (prev: Record<string, File | null>) => Record<string, File | null>) => void;
  setPreview?: (previewUrl: string) => void;
  preview?: string;
  name: string;
  className?: string;
  uploadText?: string;
  disabled?: boolean;
  onDrop?: (file: File) => void;
  uploadFormats?: string;
}

const DropZone = ({
  file,
  setFile,
  setPreview,
  preview,
  name,
  className,
  uploadText,
  disabled,
  onDrop: onDropProp,
  uploadFormats
}: DropZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile((prev: Record<string, File | null>) => ({ ...prev, [name]: file }));
        if (setPreview) {
          setPreview(URL.createObjectURL(file));
        }
        if (onDropProp) {
          onDropProp(file);
        }
      }
    },
    [name, setFile, setPreview, onDropProp]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex items-center justify-center w-full ${className || ''}`}
    >
      <div
        className={`flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isDragActive ? "border-primary" : ""
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <LiaCloudUploadAltSolid className="w-8 h-8 mb-4 text-primary" />
            <p className="mb-2 text-sm text-primary">
              <span className="font-semibold">
                {uploadText || "Click to upload"}
              </span>
            </p>
            <p className="text-xs text-primary">
              {uploadFormats || "or drag and drop"}
            </p>
          </div>
        )}
        <input {...getInputProps()} />
      </div>
    </div>
  );
};

export default DropZone;