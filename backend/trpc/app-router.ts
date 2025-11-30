import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import rulesRoute from "./routes/rules/route";
import foldersRoute from "./routes/folders/route";
import preferencesRoute from "./routes/preferences/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  rules: rulesRoute,
  folders: foldersRoute,
  preferences: preferencesRoute,
});

export type AppRouter = typeof appRouter;
