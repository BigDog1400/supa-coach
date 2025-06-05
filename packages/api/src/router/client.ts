import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { and, eq } from "@supa-coach/db";
import {
  ClientData,
  CoachClientRelationship,
  Invitation,
  Profile,
  User,
} from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    .input(
      z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        height: z.number().positive().optional(),
        heightUnit: z.enum(["cm", "feet"]),
        weight: z.number().positive().optional(),
        weightUnit: z.enum(["kg", "lbs"]),
        fitnessLevel: z
          .enum(["beginner", "intermediate", "advanced"])
          .optional(),
        fitnessGoals: z.array(z.string()).optional(),
        preferredWorkoutDays: z.array(z.string()).optional(),
        preferredWorkoutTime: z
          .enum(["morning", "afternoon", "evening"])
          .optional(),
        medicalConditions: z.string().optional(),
        dietaryRestrictions: z.string().optional(),
        additionalNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate a unique token for the invitation
      const token = uuidv4();

      // Create an invitation
      const invitation = await ctx.db
        .insert(Invitation)
        .values({
          coachId: ctx.session.user.id,
          email: input.email,
          status: "pending",
          token: token,
          clientData: input, // Store all form data in the clientData field
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        })
        .returning();

      // Send invitation email
      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: input.email,
          subject: "Invitation to join SupaCoach",
          html: `
            <p>Hello ${input.firstName},</p>
            <p>You've been invited to join SupaCoach. Click the link below to accept the invitation:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${token}">Accept Invitation</a>
          `,
        });
      } catch (error) {
        console.error("Failed to send invitation email:", error);
        throw new Error("Failed to send invitation email");
      }

      return { success: true, invitation: invitation[0] };
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

  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.query.Invitation.findFirst({
        where: (invitation, { eq }) => eq(invitation.token, input.token),
      });

      if (
        !invitation ||
        invitation.status !== "pending" ||
        invitation.expiresAt < new Date()
      ) {
        throw new Error("Invalid or expired invitation");
      }

      const clientData = invitation.clientData as ClientData;

      // Create user
      const newUser = await ctx.db
        .insert(User)
        .values({
          name: `${clientData.firstName} ${clientData.lastName}`,
          email: invitation.email,
          userType: "client",
        })
        .returning();

      await ctx.db.insert(Profile).values({
        userId: newUser[0]!.id,
        dateOfBirth: clientData.dateOfBirth ? clientData.dateOfBirth : null,
        gender: clientData.gender,
        height: clientData.height,
        weight: clientData.weight,
        fitnessLevel: clientData.fitnessLevel,
      });

      // Create coach-client relationship
      await ctx.db.insert(CoachClientRelationship).values({
        coachId: invitation.coachId,
        clientId: newUser[0]!.id,
        status: "active",
        invitationId: invitation.id,
      });

      // Update invitation status
      await ctx.db
        .update(Invitation)
        .set({ status: "accepted" })
        .where(eq(Invitation.id, invitation.id));

      // You might want to create initial records for other tables here
      // For example, creating initial goals based on clientData.fitnessGoals

      return { success: true, userId: newUser[0]!.id };
    }),
});
