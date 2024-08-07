import {useStore} from "@/providers/store-provider";
import {useEffect, useMemo, useState} from "react";
import {fetchPrompts} from "@/utils/prompts";
import useAuth from "@/hooks/useAuth";

export default () => {
  const {getAccessToken} = useAuth()
  const [isLoadingPrompts, setLoadingPrompts] = useState(true)

  const { prompts, setPrompts, promptUserId, setPromptUserId } = useStore((state) => ({
    prompts: state.prompts,
    setPrompts: state.setPrompts,
    promptUserId: state.promptUserId,
    setPromptUserId: state.setPromptUserId
  }))

  const communityPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => prompt.user_id !== promptUserId)
      .filter((prompt) => prompt.public)
  }, [prompts, promptUserId]);

  const myPrompts = useMemo(() => {
    return prompts.filter((prompt) => prompt.user_id === promptUserId);
  }, [prompts, promptUserId])

  const refreshPrompts = async () => {
    setLoadingPrompts(true)
    const accessToken = await getAccessToken();
    const response = await fetchPrompts(accessToken);
    if (response.error) {
      setLoadingPrompts(false)
      return
    }
    setPromptUserId(response.userId)
    setPrompts(response.prompts ?? []);
    setLoadingPrompts(false)
  }

  useEffect(() => {
    refreshPrompts()
  }, [])

  return {
    isLoadingPrompts,
    prompts,
    communityPrompts,
    myPrompts,
    refreshPrompts
  }
}
