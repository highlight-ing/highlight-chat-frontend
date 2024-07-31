import {useStore} from "@/providers/store-provider";
import {useEffect, useMemo} from "react";
import {fetchPrompts} from "@/utils/prompts";
import useAuth from "@/hooks/useAuth";

export default () => {
  const {getAccessToken} = useAuth()

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
    const accessToken = await getAccessToken();
    const response = await fetchPrompts(accessToken);
    if (response.error) {
      return
    }
    setPromptUserId(response.userId)
    setPrompts(response.prompts ?? []);
  }

  useEffect(() => {
    refreshPrompts()
  }, [])

  return {
    prompts,
    communityPrompts,
    myPrompts,
    refreshPrompts
  }
}
