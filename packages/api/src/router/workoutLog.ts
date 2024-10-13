import { z } from "zod";

import { eq } from "@supa-coach/db";
import { CreateWorkoutLogSchema, WorkoutLog } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workoutLogRouter = createTRPCRouter({
  getWorkoutLogs: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.WorkoutLog.findMany({
        where: (log, { eq }) => eq(log.clientId, input.clientId),
        orderBy: (log, { desc }) => [desc(log.datePerformed)],
        with: {
          workoutSession: true,
          exerciseLogs: true,
        },
      });
    }),

  createWorkoutLog: protectedProcedure
    .input(CreateWorkoutLogSchema)
    .mutation(async ({ ctx, input }) => {
      const newLog = await ctx.db.insert(WorkoutLog).values({
        ...input,
      });
      return newLog;
    }),

  updateWorkoutLog: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        datePerformed: z.date().optional(),
        status: z
          .enum(["completed", "partially_completed", "missed"])
          .optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db
        .update(WorkoutLog)
        .set({
          ...updateData,
          datePerformed: updateData.datePerformed?.toISOString(),
        })
        .where(eq(WorkoutLog.id, id));
      return { success: true };
    }),
});
