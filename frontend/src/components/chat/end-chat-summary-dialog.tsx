"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChatMemory } from "@/types";

function SummaryField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

function SummaryList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm">—</p>
      ) : (
        <ul className="list-inside list-disc text-sm">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EndChatSummaryDialog({
  chat,
  open,
  onOpenChange,
}: {
  chat: ChatMemory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Session summary</DialogTitle>
          <DialogDescription>
            This is what your coach remembered from this session. It carries
            into your next chat.
          </DialogDescription>
        </DialogHeader>

        {chat && (
          <div className="space-y-4">
            <SummaryField label="Current goal" value={chat.current_goal} />
            <SummaryList label="Preferences" items={chat.preferences} />
            <SummaryList label="Topics of interest" items={chat.topics_of_interest} />
            <SummaryField label="Progress" value={chat.progress} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
