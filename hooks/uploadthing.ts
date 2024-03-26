import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { FileRouter } from "uploadthing/types";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<FileRouter>();