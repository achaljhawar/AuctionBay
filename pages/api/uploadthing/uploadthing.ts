import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
  profilePicture: f({ image: { maxFileSize: "1MB" } })

    .onUploadComplete(async ({ metadata, file }) => {
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type fileRouter = typeof fileRouter;