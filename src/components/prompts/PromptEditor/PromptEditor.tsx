import AppScreen from "./screens/AppScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StartWithTemplateScreen from "./screens/StartWithTemplateScreen";
import {
  PromptEditorScreen,
  usePromptEditorStore,
} from "@/stores/prompt-editor";
import SuggestionsScreen from "./screens/SuggestionsScreen";

function ScreenSelector({
  active,
  name,
  title,
}: {
  active: boolean;
  name: PromptEditorScreen;
  title: string;
}) {
  const { setSelectedScreen } = usePromptEditorStore();

  return (
    <div
      className={`hover:text-light-40 hover:cursor-pointer ${
        active ? "text-white" : "text-light-60"
      }`}
      onClick={() => setSelectedScreen(name)}
    >
      {title}
    </div>
  );
}

export default function PromptEditor() {
  const { selectedScreen } = usePromptEditorStore();

  return (
    <div>
      {selectedScreen !== "startWithTemplate" && (
        <div className="flex flex-row space-x-8 border-b border-light-20 pb-3 px-6">
          <ScreenSelector
            active={selectedScreen === "app"}
            name="app"
            title="App"
          />
          <ScreenSelector
            active={selectedScreen === "suggestions"}
            name="suggestions"
            title="Suggestions"
          />
          <ScreenSelector
            active={selectedScreen === "settings"}
            name="settings"
            title="Settings"
          />
        </div>
      )}
      {selectedScreen === "startWithTemplate" && <StartWithTemplateScreen />}
      {selectedScreen === "app" && <AppScreen />}
      {selectedScreen === "suggestions" && <SuggestionsScreen />}
      {selectedScreen === "settings" && <SettingsScreen />}
    </div>
  );
}
