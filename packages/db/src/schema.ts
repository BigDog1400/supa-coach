import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// export enum UserType {
//   COACH = 'coach',
//   CLIENT = 'client',
// }

const userTypes = ["coach", "client"] as const;
export type UserType = (typeof userTypes)[number];

const genderTypes = ["male", "female", "other"] as const;
export type GenderType = (typeof genderTypes)[number];

const fitnessLevels = ["beginner", "intermediate", "advanced"] as const;
export type FitnessLevel = (typeof fitnessLevels)[number];

const suggestedDayOfWeeks = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type SuggestedDayOfWeek = (typeof suggestedDayOfWeeks)[number];

const categories = ["strength", "cardio", "flexibility"] as const;
export type Category = (typeof categories)[number];

const statuses = ["completed", "partially_completed", "missed"] as const;
export type Status = (typeof statuses)[number];

const goalStatuses = ["active", "achieved", "abandoned"] as const;
export type GoalStatus = (typeof goalStatuses)[number];

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
  userType: text("user_type", { enum: userTypes }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const UserRelations = relations(User, ({ many, one }) => ({
  accounts: many(Account),
  profile: one(Profile),
  coachClients: many(CoachClientRelationship, { relationName: "coach" }),
  clientCoaches: many(CoachClientRelationship, { relationName: "client" }),
  workoutPlans: many(WorkoutPlan),
  progressLogs: many(ProgressLog),
  goals: many(Goal),
  sentMessages: many(Message, { relationName: "sender" }),
  receivedMessages: many(Message, { relationName: "recipient" }),
}));

export const Account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

export const Profile = pgTable("profile", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  bio: text("bio"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender", { enum: genderTypes }),
  height: doublePrecision("height"),
  weight: doublePrecision("weight"),
  fitnessLevel: text("fitness_level", { enum: fitnessLevels }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ProfileRelations = relations(Profile, ({ one }) => ({
  user: one(User, { fields: [Profile.userId], references: [User.id] }),
}));

export const CoachClientRelationship = pgTable("coach_client_relationship", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  coachId: uuid("coach_id")
    .notNull()
    .references(() => User.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => User.id),
  status: text("status", {
    enum: ["pending", "active", "terminated"],
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const CoachClientRelationshipRelations = relations(
  CoachClientRelationship,
  ({ one }) => ({
    coach: one(User, {
      fields: [CoachClientRelationship.coachId],
      references: [User.id],
      relationName: "coach",
    }),
    client: one(User, {
      fields: [CoachClientRelationship.clientId],
      references: [User.id],
      relationName: "client",
    }),
  }),
);

export const WorkoutPlan = pgTable("workout_plan", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  coachId: uuid("coach_id")
    .notNull()
    .references(() => User.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => User.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  durationWeeks: integer("duration_weeks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const WorkoutPlanRelations = relations(WorkoutPlan, ({ one, many }) => ({
  coach: one(User, { fields: [WorkoutPlan.coachId], references: [User.id] }),
  client: one(User, { fields: [WorkoutPlan.clientId], references: [User.id] }),
  workoutSessions: many(WorkoutSession),
}));

export const WorkoutSession = pgTable("workout_session", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  workoutPlanId: uuid("workout_plan_id")
    .notNull()
    .references(() => WorkoutPlan.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  suggestedDayOfWeek: text("suggested_day_of_week", {
    enum: suggestedDayOfWeeks,
  }),
  suggestedWeek: integer("suggested_week"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const WorkoutSessionRelations = relations(
  WorkoutSession,
  ({ one, many }) => ({
    workoutPlan: one(WorkoutPlan, {
      fields: [WorkoutSession.workoutPlanId],
      references: [WorkoutPlan.id],
    }),
    sessionExercises: many(SessionExercise),
    workoutLogs: many(WorkoutLog),
  }),
);

export const Exercise = pgTable("exercise", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: text("category", { enum: categories }).notNull(),
  difficultyLevel: text("difficulty_level", { enum: fitnessLevels }).notNull(),
  equipmentRequired: text("equipment_required"),
  musclesTargeted: text("muscles_targeted").array(),
  isBaseExercise: boolean("is_base_exercise").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ExerciseRelations = relations(Exercise, ({ many }) => ({
  sessionExercises: many(SessionExercise),
}));

export const SessionExercise = pgTable("session_exercise", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  workoutSessionId: uuid("workout_session_id")
    .notNull()
    .references(() => WorkoutSession.id),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => Exercise.id),
  sets: integer("sets"),
  reps: integer("reps"),
  duration: integer("duration"),
  restTime: integer("rest_time"),
  order: integer("order").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const SessionExerciseRelations = relations(
  SessionExercise,
  ({ one }) => ({
    workoutSession: one(WorkoutSession, {
      fields: [SessionExercise.workoutSessionId],
      references: [WorkoutSession.id],
    }),
    exercise: one(Exercise, {
      fields: [SessionExercise.exerciseId],
      references: [Exercise.id],
    }),
  }),
);

export const WorkoutLog = pgTable("workout_log", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => User.id),
  workoutSessionId: uuid("workout_session_id")
    .notNull()
    .references(() => WorkoutSession.id),
  datePerformed: date("date_performed").notNull(),
  status: text("status", { enum: statuses }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const WorkoutLogRelations = relations(WorkoutLog, ({ one, many }) => ({
  client: one(User, { fields: [WorkoutLog.clientId], references: [User.id] }),
  workoutSession: one(WorkoutSession, {
    fields: [WorkoutLog.workoutSessionId],
    references: [WorkoutSession.id],
  }),
  exerciseLogs: many(ExerciseLog),
}));

export const ExerciseLog = pgTable("exercise_log", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  workoutLogId: uuid("workout_log_id")
    .notNull()
    .references(() => WorkoutLog.id),
  sessionExerciseId: uuid("session_exercise_id")
    .notNull()
    .references(() => SessionExercise.id),
  setsCompleted: integer("sets_completed"),
  repsCompleted: integer("reps_completed"),
  durationCompleted: integer("duration_completed"),
  weightUsed: doublePrecision("weight_used"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ExerciseLogRelations = relations(ExerciseLog, ({ one }) => ({
  workoutLog: one(WorkoutLog, {
    fields: [ExerciseLog.workoutLogId],
    references: [WorkoutLog.id],
  }),
  sessionExercise: one(SessionExercise, {
    fields: [ExerciseLog.sessionExerciseId],
    references: [SessionExercise.id],
  }),
}));

export const ProgressLog = pgTable("progress_log", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => User.id),
  date: date("date").notNull(),
  weight: doublePrecision("weight"),
  bodyFatPercentage: doublePrecision("body_fat_percentage"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ProgressLogRelations = relations(ProgressLog, ({ one }) => ({
  client: one(User, { fields: [ProgressLog.clientId], references: [User.id] }),
}));

export const Goal = pgTable("goal", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => User.id),
  description: text("description").notNull(),
  targetDate: date("target_date"),
  status: text("status", { enum: goalStatuses }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const GoalRelations = relations(Goal, ({ one }) => ({
  client: one(User, { fields: [Goal.clientId], references: [User.id] }),
}));

export const Message = pgTable("message", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => User.id),
  recipientId: uuid("recipient_id")
    .notNull()
    .references(() => User.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const MessageRelations = relations(Message, ({ one }) => ({
  sender: one(User, {
    fields: [Message.senderId],
    references: [User.id],
    relationName: "sender",
  }),
  recipient: one(User, {
    fields: [Message.recipientId],
    references: [User.id],
    relationName: "recipient",
  }),
}));
