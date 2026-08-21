"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usersApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { profileSchema, type ProfileFormValues } from "@/lib/validation/profile";
import { ApiError } from "@/types/api";
import type { User, UserUpdate } from "@/types";

function toFormValues(user: User): ProfileFormValues {
  return {
    full_name: user.full_name,
    gender: user.gender,
    birth: user.birth,
    height_cm: user.height_cm,
    address: user.address,
    shoe_size: user.shoe_size,
    interests: (user.interests ?? []).join(", "),
  };
}

function toUpdatePayload(values: ProfileFormValues): UserUpdate {
  return {
    full_name: values.full_name,
    gender: values.gender || null,
    birth: values.birth || null,
    height_cm: values.height_cm,
    address: values.address || null,
    shoe_size: values.shoe_size || null,
    interests: values.interests
      ? values.interests.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
  };
}

export default function ProfilePage() {
  const { userId, user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? toFormValues(user) : undefined,
  });

  useEffect(() => {
    if (user) {
      reset(toFormValues(user));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      usersApi.update(userId as string, toUpdatePayload(values)),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.user(userId as string), updatedUser);
      reset(toFormValues(updatedUser));
      toast.success("Profile updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't update your profile.",
      );
    },
  });

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal details. Training preferences live in your{" "}
          <span className="font-medium">survey</span>.
        </p>
      </div>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Something went wrong. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled readOnly />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" {...register("gender")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birth">Date of birth</Label>
            <Input id="birth" type="date" {...register("birth")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="height_cm">Height (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              step={0.1}
              {...register("height_cm", { valueAsNumber: true })}
            />
            {errors.height_cm && (
              <p className="text-sm text-destructive">{errors.height_cm.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shoe_size">Shoe size</Label>
            <Input id="shoe_size" {...register("shoe_size")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="interests">Interests</Label>
          <Input
            id="interests"
            placeholder="trail running, triathlon, hiking"
            {...register("interests")}
          />
          <p className="text-xs text-muted-foreground">Separate with commas.</p>
        </div>

        <Button type="submit" disabled={!isDirty || mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </form>
    </div>
  );
}
