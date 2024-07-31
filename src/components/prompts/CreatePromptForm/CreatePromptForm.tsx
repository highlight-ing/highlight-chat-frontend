"use client";

import { CreatePromptData, createPrompt } from "@/utils/prompts";
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
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import usePromptApps from "@/hooks/usePromptApps";

interface CreatePromptFormProps {
  onCreate: () => void
}

export default function CreatePromptForm(props: CreatePromptFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePromptData>({
    defaultValues: {
      visibility: "unlisted",
    },
  });
  const { refreshPrompts } = usePromptApps()
  const { openErrorModal } = useStore((state) => ({
    openErrorModal: state.openErrorModal,
  }));

  const { getAccessToken } = useAuth();

  const onSubmit: SubmitHandler<CreatePromptData> = async (data) => {
    const accessToken = await getAccessToken();
    const { error } = await createPrompt(data, accessToken);
    if (error) {
      openErrorModal(error);
      return;
    }

    refreshPrompts()
    props.onCreate()
  };

  return (
    <div className="">
      <form className="flex flex-col mt-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Field>
            <Input
              className=""
              placeholder="Slug"
              {...register("slug", {
                required: true,
              })}
            />
            <Description>
              The slug is the URL friendly identifier for your prompt. It must
              be unique, casing does not matter.
            </Description>
            {errors.slug && <ErrorMessage>Slug is required</ErrorMessage>}
          </Field>
          <Field>
            <Input
              className=""
              placeholder="Name"
              {...register("name", {
                required: true,
              })}
            />
            {errors.name && (
              <ErrorMessage>Prompt name is required</ErrorMessage>
            )}
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
        </div>
        <Button type="submit" color="cyan" className="h-10 mt-5 cursor-pointer">
          Create
        </Button>
      </form>
    </div>
  );
}
