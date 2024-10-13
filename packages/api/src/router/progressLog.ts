import { z } from "zod";

import { eq } from "@supa-coach/db";
import { CreateProgressLogSchema, ProgressLog } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const progressLogRouter = createTRPCRouter({
  getProgressLogs: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.ProgressLog.findMany({
        where: (log, { eq }) => eq(log.clientId, input.clientId),
        orderBy: (log, { desc }) => [desc(log.date)],
      });
    }),

  addProgressLog: protectedProcedure
    .input(CreateProgressLogSchema)
    .mutation(async ({ ctx, input }) => {
      const newLog = await ctx.db.insert(ProgressLog).values(input);
      return newLog;
    }),
  updateProgressLog: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        date: z.date().optional(),
        weight: z.number().optional(),
        bodyFatPercentage: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, date, ...rest } = input;
      await ctx.db
        .update(ProgressLog)
        .set({ ...rest, date: date?.toISOString() })
        .where(eq(ProgressLog.id, id));
      return { success: true };
    }),
});
