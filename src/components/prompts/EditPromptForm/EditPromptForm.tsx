"use client";

import {
  UpdatePromptData,
  deletePrompt,
  updatePrompt,
} from "@/app/(app)/prompts/actions";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "@/components/catalyst/alert";
import { Button } from "@/components/catalyst/button";
import {
  Description,
  ErrorMessage,
  Field,
  Label,
} from "@/components/catalyst/fieldset";
import { Input } from "@/components/catalyst/input";
import { Radio, RadioField, RadioGroup } from "@/components/catalyst/radio";
import { Textarea } from "@/components/catalyst/textarea";
import useAuth from "@/hooks/useAuth";
import { useStore } from "@/providers/store-provider";
import { Prompt } from "@/types/supabase-helpers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

function ConfirmDeleteModal({
  isOpen,
  setIsOpen,
  onDelete,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onDelete: () => void;
}) {
  const _onDelete = () => {
    onDelete();
    setIsOpen(false);
  };
  return (
    <Alert open={isOpen} onClose={setIsOpen}>
      <AlertTitle>Delete Prompt?</AlertTitle>
      <AlertDescription>
        Are you sure you want to delete this prompt? This action cannot be
        undone.
      </AlertDescription>
      <AlertActions>
        <Button plain onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button color="red" onClick={_onDelete}>
          Delete
        </Button>
      </AlertActions>
    </Alert>
  );
}

export default function EditPromptForm({
  slug,
  initialData,
}: {
  slug: string;
  initialData: Prompt;
}) {
  // STATE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // HOOKS
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<UpdatePromptData>({
    defaultValues: {
      visibility: initialData.public ? "public" : "unlisted",
    },
  });

  const { openErrorModal } = useStore((state) => ({
    openErrorModal: state.openErrorModal,
  }));

  const { getTokens } = useAuth();

  const onSubmit: SubmitHandler<UpdatePromptData> = async (data) => {
    const { accessToken } = await getTokens();
    const response = await updatePrompt(slug, data, accessToken);

    if (response && response.error) {
      openErrorModal(response.error);
      return;
    }

    router.push(`/prompts`);
  };

  // When the user confirms they want to delete the prompt through the modal
  const onDeleteConfirm = async () => {
    const { accessToken } = await getTokens();
    const response = await deletePrompt(slug, accessToken);

    if (response && response.error) {
      openErrorModal(response.error);
      return;
    }

    router.push(`/prompts`);
  };

  return (
    <>
      <form
        className="flex flex-col space-y-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field>
          <Input className="" value={initialData.slug ?? ""} disabled />
          <Description>
            The slug is the URL friendly identifier for your prompt. It must be
            unique, casing does not matter.
          </Description>
        </Field>
        <Field>
          <Input
            className=""
            placeholder="Name"
            value={initialData.name}
            {...register("name", {
              required: true,
            })}
          />
          {errors.name && <ErrorMessage>Prompt name is required</ErrorMessage>}
        </Field>
        <Field>
          <Textarea
            placeholder="Description"
            value={initialData.description ?? ""}
            {...register("description", {
              required: true,
            })}
          />
          <Description>
            Provide a description of your prompt that other users will see on
            the prompts store.
          </Description>
          {errors.description && (
            <ErrorMessage>Prompt description is required</ErrorMessage>
          )}
        </Field>
        <Field>
          <Textarea
            placeholder="Instructions"
            value={initialData.prompt_text ?? ""}
            {...register("instructions", {
              required: true,
            })}
          />
          {errors.instructions && (
            <ErrorMessage>Prompt instructions are required</ErrorMessage>
          )}
        </Field>
        <Field>
          <Controller
            control={control}
            name="visibility"
            render={({ field: { onChange, value } }) => (
              <RadioGroup value={value} onChange={onChange}>
                <RadioField>
                  <Radio value="public" />
                  <Label>Public</Label>
                </RadioField>
                <RadioField>
                  <Radio value="unlisted" />
                  <Label>Unlisted</Label>
                </RadioField>
              </RadioGroup>
            )}
          />
          {errors.visibility && (
            <ErrorMessage>Prompt visibility is required</ErrorMessage>
          )}
        </Field>
        <div className="flex flex-row space-x-4">
          <Button type="submit" color="cyan" className="h-10">
            Update
          </Button>
          <Button
            type="button"
            color="red"
            className="h-10"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </form>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        onDelete={onDeleteConfirm}
      />
    </>
  );
}
