"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@supa-coach/ui";
import { Button } from "@supa-coach/ui/button";
import { Calendar } from "@supa-coach/ui/calendar";
import { Checkbox } from "@supa-coach/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@supa-coach/ui/form";
import { Input } from "@supa-coach/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@supa-coach/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@supa-coach/ui/select";
import { Textarea } from "@supa-coach/ui/textarea";
import { useToast } from "@supa-coach/ui/use-toast";

import { api } from "~/trpc/react";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  height: z.number().positive().optional(),
  heightUnit: z.enum(["cm", "feet"]),
  weight: z.number().positive().optional(),
  weightUnit: z.enum(["kg", "lbs"]),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  fitnessGoals: z.array(z.string()).optional(),
  preferredWorkoutDays: z.array(z.string()).optional(),
  preferredWorkoutTime: z.enum(["morning", "afternoon", "evening"]).optional(),
  medicalConditions: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export default function AddClientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heightUnit: "cm",
      weightUnit: "kg",
      fitnessGoals: [],
      preferredWorkoutDays: [],
    },
  });

  const addClientMutation = api.client.addClient.useMutation({
    onSuccess: () => {
      toast({
        title: "Invitation Sent Successfully",
        description:
          "An invitation has been sent to the client's email address.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while sending the invitation.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.toISOString()
        : undefined,
    };
    addClientMutation.mutate(formattedValues);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Physical Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Height"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("heightUnit", value as "cm" | "feet")
                      }
                      defaultValue={form.getValues("heightUnit")}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="feet">feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Weight"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("weightUnit", value as "kg" | "lbs")
                      }
                      defaultValue={form.getValues("weightUnit")}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="fitnessLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fitness Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Goals and Preferences</h2>
          <FormField
            control={form.control}
            name="fitnessGoals"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Fitness Goals</FormLabel>
                  <FormDescription>Select all that apply.</FormDescription>
                </div>
                {["Weight Loss", "Muscle Gain", "Endurance", "Flexibility"].map(
                  (item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="fitnessGoals"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        item,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ),
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferredWorkoutDays"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">
                    Preferred Workout Days
                  </FormLabel>
                  <FormDescription>Select all that apply.</FormDescription>
                </div>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="preferredWorkoutDays"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={day}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      day,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== day,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{day}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferredWorkoutTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Workout Time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Additional Information</h2>
          <FormField
            control={form.control}
            name="medicalConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Conditions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please list any medical conditions or injuries that may affect your training."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Restrictions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please list any dietary restrictions or preferences."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information you'd like to provide."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || addClientMutation.isPending}
          >
            {(isSubmitting || addClientMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Client
          </Button>
        </div>
      </form>
    </Form>
  );
}
