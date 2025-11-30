import { z } from "zod";
import { publicProcedure } from "../../create-context.js";

export default publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }: { input: { name: string } }) => {
    return {
      hello: input.name,
      date: new Date(),
    };
  });
