"use client";
import { Edit2, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/hooks/uploadthing";
import type { ClientUploadedFileData } from "uploadthing/types";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const EditAvatar = forwardRef(
  (
    props: {
      className: string;
      profileImage: string;
      setProfileImage: Dispatch<SetStateAction<string>>;
    },
    ref: React.ForwardedRef<HTMLLabelElement>
  ) => {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const { startUpload } = useUploadThing("profilePicture", {
      onClientUploadComplete: (res) => {
        const file = res ? res[0] : undefined;
        if (file) {
          props.setProfileImage(file.url);
          console.log(file.url)
          console.log("profileImage", props.profileImage);
        }
        setIsUploading(false);
        return null;
      },
      onUploadError: (e) => {
        toast.error("Upload failed");
        setIsUploading(false);
        console.error(e);
      },
      onUploadBegin: () => {
        setIsUploading(true);
      },
    });

    const fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files.length || !e.target.files[0]) {
        toast.error("Please select a file to upload");
        return;
      }
      setIsUploading(true);
      const file = e.target.files[0];
      console.log("file", file);
      startUpload([file]);
    };

    return (
      <>
        <input
          id="file"
          accept="image/png, image/jpg, image/jpeg, image/webp, .png, .jpg, .jpeg, .webp"
          className="hidden"
          type="file"
          onChange={fileSelected}
          disabled={isUploading}
        />
        <label
          htmlFor="file"
          ref={ref}
          className={cn(
            "flex cursor-pointer items-center justify-center",
            props.className,
            isUploading ? "opacity-50 cursor-default" : ""
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Edit2 className="h-8 w-8 text-white" />
          )}
        </label>
      </>
    );
  }
);

export default EditAvatar;