import { usePromptEditorStore } from "@/stores/prompt-editor";
import PromptInput from "../PromptInput";

export default function SuggestionsScreen() {
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore();

  return (
    <PromptInput
      value={promptEditorData.suggestionsPrompt}
      onChange={(e) => setPromptEditorData({ suggestionsPrompt: e })}
    />
  );
}
