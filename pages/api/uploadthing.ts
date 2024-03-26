import { createRouteHandler } from "uploadthing/next-legacy";
 
import { fileRouter } from "@/pages/api/uploadthing/uploadthing";
 
export default createRouteHandler({
  router: fileRouter,
 
  // Apply an (optional) custom config:
  // config: { ... },
});