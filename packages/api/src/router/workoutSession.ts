import { z } from "zod";

import { eq } from "@supa-coach/db";
import { WorkoutSession } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workoutSessionRouter = createTRPCRouter({
  getWorkoutSessions: protectedProcedure
    .input(z.object({ workoutPlanId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.WorkoutSession.findMany({
        where: (session, { eq }) =>
          eq(session.workoutPlanId, input.workoutPlanId),
        orderBy: (session, { asc }) => [asc(session.order)],
      });
    }),

  createWorkoutSession: protectedProcedure
    .input(
      z.object({
        workoutPlanId: z.string().uuid(),
        name: z.string(),
        description: z.string().optional(),
        suggestedDayOfWeek: z
          .enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ])
          .optional(),
        suggestedWeek: z.number().optional(),
        order: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newSession = await ctx.db.insert(WorkoutSession).values(input);
      return newSession;
    }),

  updateWorkoutSession: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        suggestedDayOfWeek: z
          .enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ])
          .optional(),
        suggestedWeek: z.number().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db
        .update(WorkoutSession)
        .set(updateData)
        .where(eq(WorkoutSession.id, id));
      return { success: true };
    }),

  deleteWorkoutSession: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(WorkoutSession)
        .where(eq(WorkoutSession.id, input.id));
      return { success: true };
    }),
});
