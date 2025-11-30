import { createTRPCRouter } from "./create-context.js";
import hiRoute from "./routes/example/hi/route.js";
import rulesRoute from "./routes/rules/route.js";
import foldersRoute from "./routes/folders/route.js";
import preferencesRoute from "./routes/preferences/route.js";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  rules: rulesRoute,
  folders: foldersRoute,
  preferences: preferencesRoute,
});

export type AppRouter = typeof appRouter;
