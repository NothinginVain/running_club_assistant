"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Footprints, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useSession } from "@/components/providers/session-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersApi } from "@/lib/api";
import { createAccountSchema, type CreateAccountValues } from "@/lib/validation/user";
import { ApiError } from "@/types/api";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ExistingUsersPanel({ onSelect }: { onSelect: (userId: string) => void }) {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => usersApi.list(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Could not load existing runners. Check that the backend is running.
        </AlertDescription>
      </Alert>
    );
  }

  if (!users || users.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No runners yet. Create an account to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id}>
          <button
            type="button"
            onClick={() => onSelect(user.id)}
            className="flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-accent"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {initials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {user.full_name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CreateAccountPanel({ onCreated }: { onCreated: (userId: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: CreateAccountValues) => usersApi.create(values),
    onSuccess: (user) => onCreated(user.id),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Something went wrong. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" autoComplete="name" {...register("full_name")} />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const { userId, isHydrated, login } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && userId) {
      router.replace("/dashboard");
    }
  }, [isHydrated, userId, router]);

  function handleEnter(nextUserId: string) {
    login(nextUserId);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Footprints className="size-8" aria-hidden="true" />
          <h1 className="text-xl font-semibold tracking-tight">
            Running Club Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI running coach.
          </p>
        </div>

        <Tabs defaultValue="existing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Continue</TabsTrigger>
            <TabsTrigger value="create">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="existing" className="pt-4">
            <ExistingUsersPanel onSelect={handleEnter} />
          </TabsContent>
          <TabsContent value="create" className="pt-4">
            <CreateAccountPanel onCreated={handleEnter} />
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          This app doesn&apos;t verify passwords yet — choosing a runner
          signs you in as them for local development.
        </p>
      </div>
    </div>
  );
}
