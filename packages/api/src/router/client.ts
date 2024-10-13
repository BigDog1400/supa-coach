import { z } from "zod";

import { and, eq } from "@supa-coach/db";
import { CoachClientRelationship } from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const clientRouter = createTRPCRouter({
  getClients: protectedProcedure.query(async ({ ctx }) => {
    const clients = await ctx.db.query.CoachClientRelationship.findMany({
      where: (relationship, { eq }) =>
        eq(relationship.coachId, ctx.session.user.id),
      with: {
        client: {
          with: {
            profile: true,
          },
        },
      },
    });
    return clients.map((relationship) => relationship.client);
  }),

  addClient: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const newRelationship = await ctx.db
        .insert(CoachClientRelationship)
        .values({
          coachId: ctx.session.user.id,
          clientId: input.clientId,
          status: "pending",
        });
      return newRelationship;
    }),

  getClientDetails: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.query.User.findFirst({
        where: (user, { eq }) => eq(user.id, input.clientId),
        with: {
          profile: true,
          workoutPlans: true,
          progressLogs: true,
          goals: true,
        },
      });
      return client;
    }),

  updateClientStatus: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid(),
        status: z.enum(["pending", "active", "terminated"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(CoachClientRelationship)
        .set({ status: input.status })
        .where(
          and(
            eq(CoachClientRelationship.coachId, ctx.session.user.id),
            eq(CoachClientRelationship.clientId, input.clientId),
          ),
        );
      return { success: true };
    }),
});
