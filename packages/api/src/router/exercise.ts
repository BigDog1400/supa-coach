import { z } from "zod";

import { eq } from "@supa-coach/db";
import { Exercise } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getExercises: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.Exercise.findMany({
      orderBy: (exercise, { asc }) => [asc(exercise.name)],
    });
  }),

  addExercise: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.enum(["strength", "cardio", "flexibility"]),
        difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
        equipmentRequired: z.string().optional(),
        musclesTargeted: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newExercise = await ctx.db.insert(Exercise).values(input);
      return newExercise;
    }),

  updateExercise: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["strength", "cardio", "flexibility"]).optional(),
        difficultyLevel: z
          .enum(["beginner", "intermediate", "advanced"])
          .optional(),
        equipmentRequired: z.string().optional(),
        musclesTargeted: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db.update(Exercise).set(updateData).where(eq(Exercise.id, id));
      return { success: true };
    }),

  deleteExercise: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(Exercise).where(eq(Exercise.id, input.id));
      return { success: true };
    }),
});
