import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@supa-coach/db";
import { Profile, User } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.User.findFirst({
      where: (user, { eq }) => eq(user.id, ctx.session.user.id),
      with: {
        profile: true,
      },
    });
    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        fitnessLevel: z
          .enum(["beginner", "intermediate", "advanced"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(User)
          .set({ name: input.name })
          .where(eq(User.id, userId));

        const existingProfile = await tx.query.Profile.findFirst({
          where: eq(Profile.userId, userId),
        });
        if (!existingProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          });
        }

        await tx
          .update(Profile)
          .set({
            bio: input.bio,
            dateOfBirth: input.dateOfBirth?.toISOString(),
            gender: input.gender,
            height: input.height,
            weight: input.weight,
            fitnessLevel: input.fitnessLevel,
          })
          .where(eq(Profile.userId, userId));
      });

      return { success: true };
    }),
});
