"use client";

import { CreatePromptData, createPrompt } from "@/app/(app)/prompts/actions";
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
} from "@/components/catalyst/fieldset";
import { Input } from "@/components/catalyst/input";
import { Textarea } from "@/components/catalyst/textarea";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

export default function CreatePromptForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePromptData>();

  const [errorAlertIsOpen, setErrorAlertIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit: SubmitHandler<CreatePromptData> = async (data) => {
    const prompt = await createPrompt(data);
    if (prompt.error) {
      setErrorMessage(prompt.error);
      setErrorAlertIsOpen(true);
    }
  };

  return (
    <div className="">
      <form
        className="flex flex-col space-y-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field>
          <Input
            className=""
            placeholder="Slug"
            {...register("slug", {
              required: true,
            })}
          />
          <Description>
            The slug is the URL friendly identifier for your prompt. It must be
            unique, casing does not matter.
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
          {errors.name && <ErrorMessage>Prompt name is required</ErrorMessage>}
        </Field>
        <Field>
          <Textarea
            placeholder="Description"
            {...register("description", {
              required: true,
            })}
          />
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
        <Button type="submit" color="cyan" className="h-10">
          Create
        </Button>
      </form>
      {/* Error dialog */}
      <Alert open={errorAlertIsOpen} onClose={setErrorAlertIsOpen}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
        <AlertActions>
          <Button plain onClick={() => setErrorAlertIsOpen(false)}>
            Close
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
