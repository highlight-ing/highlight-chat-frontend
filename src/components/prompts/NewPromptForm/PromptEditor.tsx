import { useState } from "react";
import AppScreen from "./AppScreen";
import SettingsScreen from "./SettingsScreen";
import StartWithTemplateScreen from "./StartWithTemplateScreen";

function ScreenSelector({
  active,
  onSelect,
  name,
}: {
  active: boolean;
  onSelect: () => void;
  name: string;
}) {
  return (
    <div
      className={`hover:text-light-40 hover:cursor-pointer ${
        active ? "text-white" : "text-light-60"
      }`}
      onClick={onSelect}
    >
      {name}
    </div>
  );
}

export default function PromptEditor() {
  const [selectedScreen, setSelectedScreen] = useState("startWithTemplate");

  return (
    <div>
      {selectedScreen !== "startWithTemplate" && (
        <div className="flex flex-row space-x-8 border-b border-light-20 pb-3 px-6">
          <ScreenSelector
            active={selectedScreen === "app"}
            onSelect={() => setSelectedScreen("app")}
            name="App"
          />
          <ScreenSelector
            active={selectedScreen === "suggestions"}
            onSelect={() => setSelectedScreen("suggestions")}
            name="Suggestions"
          />
          <ScreenSelector
            active={selectedScreen === "settings"}
            onSelect={() => setSelectedScreen("settings")}
            name="Settings"
          />
        </div>
      )}
      <div className="px-6">
        {selectedScreen === "startWithTemplate" && <StartWithTemplateScreen />}
        {selectedScreen === "app" && <AppScreen />}
        {selectedScreen === "settings" && <SettingsScreen />}
      </div>
    </div>
  );
}
