import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAssigneesQuery } from "@/entities/assignee";
import { useTagsQuery } from "@/entities/tag";
import {
  fromDatetimeLocalValue,
  TICKET_PRIORITY_OPTIONS,
  type CreateTicketInput,
  type Ticket,
} from "@/entities/ticket";
import { isApiError, type ApiValidationDetail } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { TagMultiSelect } from "@/shared/ui/tag-multi-select";
import { Textarea } from "@/shared/ui/textarea";

import { createTicketSchema, type CreateTicketFormValues } from "../model/create-ticket.schema";
import { useCreateTicket } from "../model/use-create-ticket";

const priorityItems = TICKET_PRIORITY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const fieldIds = {
  title: "create-ticket-title",
  description: "create-ticket-description",
  customerName: "create-ticket-customer-name",
  customerEmail: "create-ticket-customer-email",
  priority: "create-ticket-priority",
  deadline: "create-ticket-deadline",
  assigneeId: "create-ticket-assignee",
  tagIds: "create-ticket-tags",
} as const;

function mapServerDetailsToFields(
  details: ApiValidationDetail[] | undefined,
  setError: ReturnType<typeof useForm<CreateTicketFormValues>>["setError"],
) {
  if (!details?.length) {
    return false;
  }

  let mapped = false;
  for (const detail of details) {
    if (detail.field in fieldIds) {
      setError(detail.field as keyof CreateTicketFormValues, {
        type: "server",
        message: detail.message,
      });
      mapped = true;
    }
  }

  return mapped;
}

function toCreateInput(values: CreateTicketFormValues): CreateTicketInput {
  return {
    title: values.title,
    description: values.description,
    customerName: values.customerName,
    customerEmail: values.customerEmail,
    priority: values.priority,
    deadline: fromDatetimeLocalValue(values.deadline ?? ""),
    assigneeId:
      !values.assigneeId || values.assigneeId === "none" ? null : Number(values.assigneeId),
    tagIds: values.tagIds,
  };
}

type CreateTicketFormProps = {
  onCancel?: () => void;
  onSuccess?: (ticket: Ticket) => void;
  navigateOnSuccess?: boolean;
};

export function CreateTicketForm({
  onCancel,
  onSuccess,
  navigateOnSuccess = true,
}: CreateTicketFormProps) {
  const { createTicket, isPending } = useCreateTicket();
  const assigneesQuery = useAssigneesQuery();
  const tagsQuery = useTagsQuery();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      customerName: "",
      customerEmail: "",
      priority: "medium",
      deadline: "",
      assigneeId: "none",
      tagIds: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = form;

  const assigneeItems = [
    { value: "none", label: "Unassigned" },
    ...(assigneesQuery.data ?? []).map((assignee) => ({
      value: String(assignee.id),
      label: assignee.name,
    })),
  ];

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setFormError(null);
        try {
          await createTicket(toCreateInput(values), {
            navigateToDetail: navigateOnSuccess,
            onSuccess,
          });
        } catch (error) {
          if (isApiError(error)) {
            const mapped = mapServerDetailsToFields(error.details, setError);
            if (!mapped) {
              setFormError(error.message);
            }
            return;
          }

          setFormError(
            error instanceof Error
              ? error.message
              : "Could not create the ticket. Please try again.",
          );
        }
      })}
    >
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not create ticket</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={fieldIds.title}>Title</Label>
        <Input
          id={fieldIds.title}
          aria-invalid={Boolean(errors.title)}
          disabled={isPending}
          placeholder="Unable to complete payment"
          {...register("title")}
        />
        {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={fieldIds.description}>Description</Label>
        <Textarea
          id={fieldIds.description}
          aria-invalid={Boolean(errors.description)}
          disabled={isPending}
          rows={5}
          placeholder="Describe what happened and what the customer needs"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={fieldIds.customerName}>Customer name</Label>
          <Input
            id={fieldIds.customerName}
            aria-invalid={Boolean(errors.customerName)}
            disabled={isPending}
            placeholder="Jane Smith"
            {...register("customerName")}
          />
          {errors.customerName ? (
            <p className="text-xs text-destructive">{errors.customerName.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={fieldIds.customerEmail}>Customer email</Label>
          <Input
            id={fieldIds.customerEmail}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.customerEmail)}
            disabled={isPending}
            placeholder="jane@example.com"
            {...register("customerEmail")}
          />
          {errors.customerEmail ? (
            <p className="text-xs text-destructive">{errors.customerEmail.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={fieldIds.priority}>Priority</Label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select
              items={priorityItems}
              value={field.value}
              onValueChange={(value) => {
                if (value !== null) {
                  field.onChange(value);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger
                id={fieldIds.priority}
                className="w-full"
                aria-invalid={Boolean(errors.priority)}
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.priority ? (
          <p className="text-xs text-destructive">{errors.priority.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={fieldIds.deadline}>Deadline</Label>
        <Input
          id={fieldIds.deadline}
          type="datetime-local"
          disabled={isPending}
          {...register("deadline")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={fieldIds.assigneeId}>Assignee</Label>
        <Controller
          control={control}
          name="assigneeId"
          render={({ field }) => (
            <Select
              items={assigneeItems}
              value={field.value ?? "none"}
              onValueChange={(value) => {
                if (value !== null) {
                  field.onChange(value);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger id={fieldIds.assigneeId} className="w-full">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assigneeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={fieldIds.tagIds}>Tags</Label>
        <Controller
          control={control}
          name="tagIds"
          render={({ field }) => (
            <TagMultiSelect
              id={fieldIds.tagIds}
              tags={tagsQuery.data ?? []}
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
              placeholder="Select tags"
            />
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Creating…" : "Create ticket"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Link
            to="/?view=list"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              isPending && "pointer-events-none opacity-50",
            )}
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
