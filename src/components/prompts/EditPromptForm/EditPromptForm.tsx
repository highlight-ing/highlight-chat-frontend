"use client";

import {
  UpdatePromptData,
  deletePrompt,
  updatePrompt,
} from "@/utils/prompts";
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
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import usePromptApps from "@/hooks/usePromptApps";
import {useShallow} from "zustand/react/shallow";
import { trackEvent } from '@/utils/amplitude';
import { useEffect } from 'react';

export default function EditPromptForm({
  slug,
  initialData,
  onUpdate,
}: {
  slug: string;
  initialData: Prompt;
  onUpdate: () => void
}) {
  const { refreshPrompts } = usePromptApps()
  // STATE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<UpdatePromptData>({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? "",
      instructions: initialData.prompt_text ?? "",
      visibility: initialData.public ? "public" : "unlisted",
    },
  });

  const { promptAppName, clearPrompt, openErrorModal } = useStore(
    useShallow((state) => ({
      promptAppName: state.promptAppName,
      clearPrompt: state.clearPrompt,
      openErrorModal: state.openErrorModal,
    }))
  );

  const { getAccessToken } = useAuth();

  useEffect(() => {
    trackEvent('hl_chat_edit_prompt_form_appeared', { promptSlug: slug });
  }, [slug]);

  const onSubmit: SubmitHandler<UpdatePromptData> = async (data) => {
    const accessToken = await getAccessToken();
    const response = await updatePrompt(slug, data, accessToken);

    if (response && response.error) {
      openErrorModal(response.error);
      trackEvent('hl_chat_edit_prompt_error', { promptSlug: slug, error: response.error });
      return;
    }

    trackEvent('hl_chat_prompt_updated', { 
      promptSlug: slug,
      promptVisibility: data.visibility,
    });

    refreshPrompts()
    onUpdate()
  };

  // When the user confirms they want to delete the prompt through the modal
  const onDeleteConfirm = async () => {
    const accessToken = await getAccessToken();
    const response = await deletePrompt(slug, accessToken);

    if (response && response.error) {
      openErrorModal(response.error);
      trackEvent('hl_chat_delete_prompt_error', { promptSlug: slug, error: response.error });
      return;
    }

    trackEvent('hl_chat_prompt_deleted', { promptSlug: slug });

    if (promptAppName === slug) {
      clearPrompt()
    }

    refreshPrompts()
    onUpdate()
  };

  // Watch for changes in the visibility field
  const visibility = watch('visibility');
  useEffect(() => {
    trackEvent('hl_chat_prompt_visibility_changed', { 
      promptSlug: slug,
      newVisibility: visibility,
    });
  }, [visibility, slug]);

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
            {...register("name", {
              required: true,
            })}
          />
          {errors.name && <ErrorMessage>Prompt name is required</ErrorMessage>}
        </Field>
        <Field>
          <Textarea
            placeholder="Description"
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
          <Button 
            type="submit" 
            color="cyan" 
            className="h-10"
            onClick={() => trackEvent('hl_chat_edit_prompt_update_clicked', { promptSlug: slug })}
          >
            Update
          </Button>
          <Button
            type="button"
            color="red"
            className="h-10"
            onClick={() => {
              setIsDeleteModalOpen(true);
              trackEvent('hl_chat_delete_prompt_initiated', { promptSlug: slug });
            }}
          >
            Delete
          </Button>
        </div>
      </form>
      {
        isDeleteModalOpen &&
        <ConfirmationModal
          id={'delete-prompt'}
          header={'Delete Prompt?'}
          primaryAction={{
            label: 'Delete Forever', 
            onClick: onDeleteConfirm
          }}
          secondaryAction={{
            label: 'Nevermind', 
            onClick: () => {
              setIsDeleteModalOpen(false);
              trackEvent('hl_chat_delete_prompt_cancelled', { promptSlug: slug });
            }
          }}
        >
          <span>Are you sure you want to delete this prompt?</span>
          <span>This action cannot be undone.</span>
        </ConfirmationModal>
      }
    </>
  );
}