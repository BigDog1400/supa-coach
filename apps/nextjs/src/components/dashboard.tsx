"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar as CalendarIcon,
  MessageSquare,
  Plus,
  PlusCircle,
  Users,
} from "lucide-react";

import { Button, buttonVariants } from "@supa-coach/ui/button";
import { Calendar } from "@supa-coach/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@supa-coach/ui/card";
import { Progress } from "@supa-coach/ui/progress";

import { api } from "~/trpc/react";

export default function Dashboard() {
  const [data] = api.dashboard.getDashboardStats.useSuspenseQuery();

  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          <Link
            href="/dashboard/add-client"
            className={buttonVariants({ variant: "primary" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Link>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" /> Create Workout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Client Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">Goals Met</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">
                    Workout Completion
                  </span>
                  <span className="text-sm font-medium">88%</span>
                </div>
                <Progress value={88} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentWorkoutLogs.length > 0 ? (
              <ul className="space-y-2">
                {data.recentWorkoutLogs.map((log, index) => (
                  <li key={index} className="text-sm">
                    {log.client.name} completed {log.workoutSession.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-4 text-center">
                <CalendarIcon className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">
                  Completed workouts will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                New message from Emily R.
              </li>
              <li className="flex items-center text-sm">
                <Bell className="mr-2 h-4 w-4 text-yellow-500" />
                Reminder: Update Mike's program
              </li>
              <li className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-green-500" />3 new client
                requests
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.clientCount}</div>
                <div className="text-sm text-muted-foreground">
                  Active Clients
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {data.workoutPlanCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Workouts Created
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {data.recentWorkoutLogs.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Recent Workouts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
