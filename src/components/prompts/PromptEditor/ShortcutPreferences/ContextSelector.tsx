
import { useState, useEffect } from "react";
import { usePromptEditorStore } from "@/stores/prompt-editor";
import { Switch } from "@/components/catalyst/switch";
import { AudioIcon, ClipboardIcon, ScreenshotIcon, TextIcon } from "@/components/icons";

interface ContextTypes {
  selected_text: boolean;
  audio_transcription: boolean;
  clipboard_text: boolean;
  screenshot: boolean;
}

interface ContextOption {
  id: keyof ContextTypes;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const contextOptions: ContextOption[] = [
  {
    id: "selected_text",
    label: "Selected Text",
    description: "Trigger this prompt when text is selected",
    icon: <TextIcon />,
  },
  {
    id: "audio_transcription",
    label: "Audio",
    description: "Use with transcribed audio content",
    icon: <AudioIcon />,
  },
  {
    id: "clipboard_text",
    label: "Clipboard Text",
    description: "Access clipboard content with this prompt",
    icon: <ClipboardIcon />,
  },
  {
    id: "screenshot",
    label: "Screenshot",
    description: "Use with captured screenshots",
    icon: <ScreenshotIcon />,
  },
];

function ToggleSwitch({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-right text-xs font-normal leading-snug text-white/40">
        {checked ? "ON" : "OFF"}
      </div>
      <Switch checked={checked} color={"cyan"} onChange={onToggle} />
    </div>
  );
}

export default function ContextSelector() {
    const { selectedApp, contextTypes, setContextTypes } = usePromptEditorStore();
    const [isEnabled, setIsEnabled] = useState(false);
  
    const toggleContext = (contextId: keyof ContextTypes) => {
      setContextTypes({
        ...contextTypes,
        [contextId]: !contextTypes[contextId],
      });
    };
  
    // Effect to handle initial state and changes
    useEffect(() => {
      const allTypesEnabled = Object.values(contextTypes || {}).every(
        (value) => value === true
      );
      setIsEnabled(!allTypesEnabled);
    }, [contextTypes]);
  
    const handleMasterToggle = (enabled: boolean) => {
      setIsEnabled(enabled);
      if (enabled) {
        // When turning ON context specification, set all to false
        setContextTypes({
          selected_text: false,
          audio_transcription: false,
          clipboard_text: false,
          screenshot: false,
        });
      } else {
        // When turning OFF context specification, set all to true
        setContextTypes({
          selected_text: true,
          audio_transcription: true,
          clipboard_text: true,
          screenshot: true,
        });
      }
    };
  
    if (selectedApp === "hidden") {
      return null;
    }

  return (
    <div className="flex flex-col space-y-3 rounded-2xl bg-[#222222] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-[13px] font-medium leading-normal text-[#eeeeee]">
            Add Context Specification
          </h4>
        </div>
        <ToggleSwitch checked={isEnabled} onToggle={handleMasterToggle} />
      </div>
      <div className="border-t border-white/5" />
      <p className="text-xs font-normal leading-tight text-[#6e6e6e]">
        Specify the context you want to use for this shortcut.
      </p>

      {isEnabled && (
        <div className="grid grid-cols-2 gap-2">
          {contextOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleContext(option.id)}
              className={`p-2 border h-14 rounded-lg flex items-center justify-between gap-2 text-xs ${
                contextTypes[option.id]
                  ? "border-green-40 bg-green-10"
                  : "border-[#252525] hover:bg-neutral-800/15"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-7 w-7 rounded-md p-1.5 border border-[0.25px] border-[#333333]"
                  style={{
                    background:
                      "linear-gradient(139deg, #333 3.52%, #161818 51.69%)",
                  }}
                >
                  {option.icon}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs truncate w-full whitespace-nowrap">
                    {option.label}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
