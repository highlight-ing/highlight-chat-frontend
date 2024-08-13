import { useStore } from "@/providers/store-provider";
import { useEffect, useMemo, useState } from "react";
import { fetchPrompts, fetchPromptText } from "@/utils/prompts";
import useAuth from "@/hooks/useAuth";
import { PromptApp } from "@/types";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

export default () => {
  const { getAccessToken } = useAuth();
  const router = useRouter();
  const [isLoadingPrompts, setLoadingPrompts] = useState(true);

  const {
    prompts,
    setPrompts,
    promptUserId,
    setPromptUserId,
    setPrompt,
    clearPrompt,
  } = useStore(
    useShallow((state) => ({
      prompts: state.prompts,
      setPrompts: state.setPrompts,
      promptUserId: state.promptUserId,
      setPromptUserId: state.setPromptUserId,
      setPrompt: state.setPrompt,
      clearPrompt: state.clearPrompt,
    }))
  );

  const communityPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => prompt.user_id !== promptUserId)
      .filter((prompt) => prompt.public);
  }, [prompts, promptUserId]);

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === promptUserId);
  }, [prompts, promptUserId]);

  const refreshPrompts = async () => {
    setLoadingPrompts(true);
    const accessToken = await getAccessToken();
    const response = await fetchPrompts(accessToken);
    if (response.error) {
      setLoadingPrompts(false);
      return;
    }
    setPromptUserId(response.userId);
    setPrompts(response.prompts ?? []);
    setLoadingPrompts(false);
  };

  const selectPrompt = async (prompt: PromptApp) => {
    if (prompt.slug === "hlchat") {
      clearPrompt();
      router.push("/");
      return;
    }

    // Fetch the prompt
    const text = await fetchPromptText(prompt.slug!);

    setPrompt({
      promptApp: prompt,
      promptName: prompt.name,
      promptDescription: prompt.description!,
      promptAppName: prompt.slug!,
      prompt: text,
    });

    router.push(`/`);
  };

  useEffect(() => {
    refreshPrompts();
  }, []);

  return {
    isLoadingPrompts,
    prompts,
    communityPrompts,
    myPrompts,
    refreshPrompts,
    selectPrompt,
  };
};
