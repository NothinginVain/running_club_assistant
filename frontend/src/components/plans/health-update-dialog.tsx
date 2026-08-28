"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCreateHealthUpdate } from "@/hooks/use-feedback";
import { MEDICALLY_CLEARED_ACTIVITY_OPTIONS } from "@/lib/survey-options";
import { ApiError } from "@/types/api";
import { MedicallyClearedActivity } from "@/types/enums";
import type {
  ProfessionalClearanceStatus,
  WalkingSymptomResponse,
  WarningSymptom,
} from "@/types";

const WARNING_SYMPTOM_OPTIONS: { value: WarningSymptom; label: string }[] = [
  { value: "none", label: "None of these" },
  { value: "swelling", label: "Swelling" },
  { value: "restricted_movement", label: "Restricted movement" },
  { value: "abnormal_walking", label: "Abnormal walking" },
  { value: "worsening_daily", label: "Worsening daily" },
];

const WALKING_SYMPTOM_RESPONSE_OPTIONS: {
  value: WalkingSymptomResponse;
  label: string;
}[] = [
  { value: "no_increase", label: "No, walking doesn't increase symptoms" },
  { value: "symptoms_increase", label: "Yes, walking increases symptoms" },
  { value: "not_tried", label: "Haven't tried walking" },
];

const PROFESSIONAL_CLEARANCE_STATUS_OPTIONS: {
  value: ProfessionalClearanceStatus;
  label: string;
}[] = [
  { value: "not_assessed", label: "Not assessed by a professional" },
  { value: "not_cleared", label: "Assessed, not cleared" },
  { value: "cleared", label: "Assessed and cleared" },
];

const CLEARED_ACTIVITY_OPTIONS = MEDICALLY_CLEARED_ACTIVITY_OPTIONS.filter(
  (option) => option.value !== MedicallyClearedActivity.NOT_CLEARED,
);

function toggleValue<T extends string>(list: T[], value: T, checked: boolean): T[] {
  if (checked) {
    if (value === "none" || value === MedicallyClearedActivity.NOT_CLEARED) {
      return [value];
    }
    return [...list.filter((item) => item !== "none"), value];
  }
  return list.filter((item) => item !== value);
}

export function HealthUpdateDialog({
  recommendationId,
  message,
  open,
  onOpenChange,
}: {
  recommendationId: string;
  message?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [painLevel, setPainLevel] = useState(0);
  const [warningSymptoms, setWarningSymptoms] = useState<WarningSymptom[]>([]);
  const [walkingSymptomResponse, setWalkingSymptomResponse] =
    useState<WalkingSymptomResponse | "">("");
  const [professionalClearanceStatus, setProfessionalClearanceStatus] =
    useState<ProfessionalClearanceStatus | "">("");
  const [clearedActivities, setClearedActivities] = useState<
    MedicallyClearedActivity[]
  >([]);
  const [hasAdditionalRestrictions, setHasAdditionalRestrictions] = useState(false);

  const createHealthUpdate = useCreateHealthUpdate(recommendationId);

  const isCleared = professionalClearanceStatus === "cleared";
  const canSubmit =
    warningSymptoms.length > 0 &&
    walkingSymptomResponse !== "" &&
    professionalClearanceStatus !== "" &&
    (!isCleared || clearedActivities.length > 0);

  function resetForm() {
    setPainLevel(0);
    setWarningSymptoms([]);
    setWalkingSymptomResponse("");
    setProfessionalClearanceStatus("");
    setClearedActivities([]);
    setHasAdditionalRestrictions(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !walkingSymptomResponse || !professionalClearanceStatus) return;

    createHealthUpdate.mutate(
      {
        current_pain_level: painLevel,
        warning_symptoms: warningSymptoms,
        walking_symptom_response: walkingSymptomResponse,
        professional_clearance_status: professionalClearanceStatus,
        medically_cleared_activities: isCleared ? clearedActivities : null,
        has_additional_restrictions: hasAdditionalRestrictions,
      },
      {
        onSuccess: () => {
          toast.success(
            "Health update saved. Generate an updated plan again when you're ready.",
          );
          onOpenChange(false);
          resetForm();
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't save your health update.",
          );
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Health update needed</DialogTitle>
          <DialogDescription>
            {message ||
              "For your safety, we need current details before your coach can revise this plan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="health-update-pain-level">Current pain level</Label>
              <span className="text-sm text-muted-foreground">{painLevel}/10</span>
            </div>
            <Slider
              id="health-update-pain-level"
              min={0}
              max={10}
              step={1}
              value={[painLevel]}
              onValueChange={(value) =>
                setPainLevel(Array.isArray(value) ? value[0] : value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Any warning symptoms?</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {WARNING_SYMPTOM_OPTIONS.map((option) => {
                const checkboxId = `warning-symptom-${option.value}`;
                const checked = warningSymptoms.includes(option.value);

                return (
                  <label
                    key={option.value}
                    htmlFor={checkboxId}
                    className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={(state) =>
                        setWarningSymptoms((current) =>
                          toggleValue(current, option.value, state === true),
                        )
                      }
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="health-update-walking-response">
              Does walking increase your symptoms?
            </Label>
            <Select
              value={walkingSymptomResponse}
              onValueChange={(value) =>
                setWalkingSymptomResponse(value as WalkingSymptomResponse)
              }
            >
              <SelectTrigger id="health-update-walking-response" className="w-full">
                <SelectValue placeholder="Select an option">
                  {(value: string) =>
                    WALKING_SYMPTOM_RESPONSE_OPTIONS.find(
                      (option) => option.value === value,
                    )?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {WALKING_SYMPTOM_RESPONSE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="health-update-clearance-status">
              Professional assessment status
            </Label>
            <Select
              value={professionalClearanceStatus}
              onValueChange={(value) => {
                setProfessionalClearanceStatus(value as ProfessionalClearanceStatus);
                if (value !== "cleared") setClearedActivities([]);
              }}
            >
              <SelectTrigger id="health-update-clearance-status" className="w-full">
                <SelectValue placeholder="Select an option">
                  {(value: string) =>
                    PROFESSIONAL_CLEARANCE_STATUS_OPTIONS.find(
                      (option) => option.value === value,
                    )?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONAL_CLEARANCE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCleared && (
            <div className="space-y-2">
              <Label>Which activities were you cleared for?</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CLEARED_ACTIVITY_OPTIONS.map((option) => {
                  const checkboxId = `cleared-activity-${option.value}`;
                  const checked = clearedActivities.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      htmlFor={checkboxId}
                      className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={checked}
                        onCheckedChange={(state) =>
                          setClearedActivities((current) =>
                            toggleValue(current, option.value, state === true),
                          )
                        }
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <Label htmlFor="health-update-additional-restrictions" className="text-sm">
              Any other restrictions not covered above?
            </Label>
            <Switch
              id="health-update-additional-restrictions"
              checked={hasAdditionalRestrictions}
              onCheckedChange={(state) => setHasAdditionalRestrictions(state === true)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createHealthUpdate.isPending}>
              {createHealthUpdate.isPending && <Loader2 className="size-4 animate-spin" />}
              Save health update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
