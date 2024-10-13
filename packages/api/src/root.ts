import { authRouter } from "./router/auth";
import { clientRouter } from "./router/client";
import { dashboardRouter } from "./router/dashboard";
import { exerciseRouter } from "./router/exercise";
import { progressLogRouter } from "./router/progressLog";
import { userRouter } from "./router/user";
import { workoutLogRouter } from "./router/workoutLog";
import { workoutPlanRouter } from "./router/workoutPlan";
import { workoutSessionRouter } from "./router/workoutSession";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  client: clientRouter,
  exercise: exerciseRouter,
  workoutPlan: workoutPlanRouter,
  workoutSession: workoutSessionRouter,
  workoutLog: workoutLogRouter,
  progressLog: progressLogRouter,
  dashboard: dashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
