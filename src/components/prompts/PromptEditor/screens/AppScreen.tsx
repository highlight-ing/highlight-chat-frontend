import { usePromptEditorStore } from "@/stores/prompt-editor";
import PromptInput from "../PromptInput";

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore();

  return (
    <PromptInput
      value={promptEditorData.appPrompt}
      onChange={(e) => setPromptEditorData({ appPrompt: e })}
    />
  );
}
