"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToggleFavorite } from "@/hooks/use-recommendation-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FavoriteButton({
  recommendationId,
  isFavorite,
  size = "default",
}: {
  recommendationId: string;
  isFavorite: boolean;
  size?: "default" | "sm";
}) {
  const toggleFavorite = useToggleFavorite(recommendationId);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite.mutate(!isFavorite, {
      onError: () => {
        toast.error("Couldn't update favorite. Please try again.");
      },
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(size === "sm" && "size-8")}
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "size-4",
          isFavorite && "fill-destructive text-destructive",
        )}
      />
    </Button>
  );
}
