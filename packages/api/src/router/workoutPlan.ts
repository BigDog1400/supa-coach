import { z } from "zod";

import { eq } from "@supa-coach/db";
import { CreateWorkoutPlanSchema, WorkoutPlan } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workoutPlanRouter = createTRPCRouter({
  getWorkoutPlans: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.WorkoutPlan.findMany({
      where: (plan, { eq }) => eq(plan.coachId, ctx.session.user.id),
      orderBy: (plan, { desc }) => [desc(plan.createdAt)],
    });
  }),

  createWorkoutPlan: protectedProcedure
    .input(CreateWorkoutPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const newPlan = await ctx.db.insert(WorkoutPlan).values({
        ...input,
        coachId: ctx.session.user.id,
      });
      return newPlan;
    }),

  updateWorkoutPlan: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        durationWeeks: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db
        .update(WorkoutPlan)
        .set({
          ...updateData,
          startDate: updateData.startDate?.toISOString(),
          endDate: updateData.endDate?.toISOString(),
        })
        .where(eq(WorkoutPlan.id, id));
      return { success: true };
    }),

  deleteWorkoutPlan: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(WorkoutPlan).where(eq(WorkoutPlan.id, input.id));
      return { success: true };
    }),
});
