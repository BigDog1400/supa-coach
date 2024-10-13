import { and, eq, gte } from "drizzle-orm";

import { sql } from "@supa-coach/db";
import {
  CoachClientRelationship,
  WorkoutLog,
  WorkoutPlan,
} from "@supa-coach/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dashboardRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [clientCount, workoutPlanCount, recentWorkoutLogs] =
      await Promise.all([
        ctx.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(CoachClientRelationship)
          .where(eq(CoachClientRelationship.coachId, userId))
          .then((result) => result[0]?.count ?? 0),

        ctx.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(WorkoutPlan)
          .where(eq(WorkoutPlan.coachId, userId))
          .then((result) => result[0]?.count ?? 0),

        ctx.db.query.WorkoutLog.findMany({
          where: and(
            eq(WorkoutLog.clientId, userId),
            gte(WorkoutLog.datePerformed, sql`${sevenDaysAgo}::date`),
          ),
          orderBy: (log, { desc }) => [desc(log.datePerformed)],
          limit: 10,
          with: {
            client: {
              columns: {
                name: true,
              },
            },
            workoutSession: {
              columns: {
                name: true,
              },
            },
          },
        }),
      ]);

    return {
      clientCount,
      workoutPlanCount,
      recentWorkoutLogs,
    };
  }),
});
