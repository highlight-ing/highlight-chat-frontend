import { useState } from "react";
import { usePromptEditorStore } from '@/stores/prompt-editor'
// import { TextIcon, MicrophoneIcon, ClipboardIcon, CameraIcon } from '@/components/icons'
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
}

const contextOptions: ContextOption[] = [
  {
    id: 'selected_text',
    label: 'Selected Text',
    description: 'Trigger this prompt when text is selected'
  },
  {
    id: 'audio_transcription',
    label: 'Audio Transcription',
    description: 'Use with transcribed audio content'
  },
  {
    id: 'clipboard_text',
    label: 'Clipboard Text',
    description: 'Access clipboard content with this prompt'
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    description: 'Use with captured screenshots'
  }
];

// ... existing imports and interfaces ...

export default function ContextSelector() {
  const [contextTypes, setContextTypes] = useState<ContextTypes>({
    selected_text: false,
    audio_transcription: false,
    clipboard_text: false,
    screenshot: false
  });

  const toggleContext = (contextId: keyof ContextTypes) => {
    setContextTypes(prev => ({
      ...prev,
      [contextId]: !prev[contextId]
    }));
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 className="text-base font-semibold text-white">Specify Contexts</h3>
      <p className="text-xs font-normal leading-tight text-[#6e6e6e] mb-4">
        Tie a shortcut to available context under which this shortcut will be suggested.
      </p>
      
      <div className="flex flex-col gap-3">
      {contextOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between w-full"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{option.label}</span>
              <span className="text-xs text-[#6e6e6e]">{option.description}</span>
            </div>
            <button
              onClick={() => toggleContext(option.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                contextTypes[option.id] ? 'bg-blue-600' : 'bg-[#333333]'
              }`}
            >
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ml-0.5"
                style={{ 
                  transform: contextTypes[option.id] ? 'translateX(1rem)' : 'translateX(0)'
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}