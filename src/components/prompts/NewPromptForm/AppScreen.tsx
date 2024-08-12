import CodeEditor from "@uiw/react-textarea-code-editor";
import { useState } from "react";

function ScreenIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.7068 1.33301H4.2735C2.6535 1.33301 1.3335 2.65301 1.3335 4.27301V8.60634V8.73968C1.3335 10.3663 2.6535 11.6797 4.2735 11.6797H6.8335C7.20016 11.6797 7.50016 11.9797 7.50016 12.3463V12.993C7.50016 13.3597 7.20016 13.6597 6.8335 13.6597H5.22016C4.94683 13.6597 4.72016 13.8863 4.72016 14.1597C4.72016 14.433 4.94016 14.6663 5.22016 14.6663H10.7868C11.0602 14.6663 11.2868 14.4397 11.2868 14.1663C11.2868 13.893 11.0602 13.6663 10.7868 13.6663H9.1735C8.80683 13.6663 8.50683 13.3663 8.50683 12.9997V12.353C8.50683 11.9863 8.80683 11.6863 9.1735 11.6863H11.7135C13.3402 11.6863 14.6535 10.3663 14.6535 8.74634V8.61301V4.27968C14.6468 2.65301 13.3268 1.33301 11.7068 1.33301Z"
        fill="#FF2099"
        fill-opacity="0.6"
      />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 11C1.72667 11 1.5 10.7733 1.5 10.5V5.5C1.5 5.22667 1.72667 5 2 5C2.27333 5 2.5 5.22667 2.5 5.5V10.5C2.5 10.7733 2.27333 11 2 11Z"
        fill="#4CEDA0"
        fill-opacity="0.6"
      />
      <path
        d="M5 12.6663C4.72667 12.6663 4.5 12.4397 4.5 12.1663V3.83301C4.5 3.55967 4.72667 3.33301 5 3.33301C5.27333 3.33301 5.5 3.55967 5.5 3.83301V12.1663C5.5 12.4397 5.27333 12.6663 5 12.6663Z"
        fill="#4CEDA0"
        fill-opacity="0.6"
      />
      <path
        d="M8 14.3337C7.72667 14.3337 7.5 14.107 7.5 13.8337V2.16699C7.5 1.89366 7.72667 1.66699 8 1.66699C8.27333 1.66699 8.5 1.89366 8.5 2.16699V13.8337C8.5 14.107 8.27333 14.3337 8 14.3337Z"
        fill="#4CEDA0"
        fill-opacity="0.6"
      />
      <path
        d="M11 12.6663C10.7267 12.6663 10.5 12.4397 10.5 12.1663V3.83301C10.5 3.55967 10.7267 3.33301 11 3.33301C11.2733 3.33301 11.5 3.55967 11.5 3.83301V12.1663C11.5 12.4397 11.2733 12.6663 11 12.6663Z"
        fill="#4CEDA0"
        fill-opacity="0.6"
      />
      <path
        d="M14 11C13.7267 11 13.5 10.7733 13.5 10.5V5.5C13.5 5.22667 13.7267 5 14 5C14.2733 5 14.5 5.22667 14.5 5.5V10.5C14.5 10.7733 14.2733 11 14 11Z"
        fill="#4CEDA0"
        fill-opacity="0.6"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.99996 7.99968C9.84091 7.99968 11.3333 6.50729 11.3333 4.66634C11.3333 2.82539 9.84091 1.33301 7.99996 1.33301C6.15901 1.33301 4.66663 2.82539 4.66663 4.66634C4.66663 6.50729 6.15901 7.99968 7.99996 7.99968Z"
        fill="#ECFF0C"
        fill-opacity="0.6"
      />
      <path
        d="M7.99994 9.66699C4.65994 9.66699 1.93994 11.907 1.93994 14.667C1.93994 14.8537 2.08661 15.0003 2.27327 15.0003H13.7266C13.9133 15.0003 14.0599 14.8537 14.0599 14.667C14.0599 11.907 11.3399 9.66699 7.99994 9.66699Z"
        fill="#ECFF0C"
        fill-opacity="0.6"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.72003 12.6735L1.7067 12.6868C1.5267 12.2935 1.41337 11.8468 1.3667 11.3535C1.41337 11.8402 1.54003 12.2802 1.72003 12.6735Z"
        fill="#FF2099"
        fill-opacity="0.6"
      />
      <path
        d="M6 6.91943C6.87629 6.91943 7.58666 6.20905 7.58666 5.33276C7.58666 4.45647 6.87629 3.74609 6 3.74609C5.12371 3.74609 4.41333 4.45647 4.41333 5.33276C4.41333 6.20905 5.12371 6.91943 6 6.91943Z"
        fill="#FF2099"
      />
      <path
        d="M10.7933 1.33398H5.20659C2.77992 1.33398 1.33325 2.78065 1.33325 5.20732V10.794C1.33325 11.5207 1.45992 12.154 1.70659 12.6873C2.27992 13.954 3.50659 14.6673 5.20659 14.6673H10.7933C13.2199 14.6673 14.6666 13.2207 14.6666 10.794V9.26732V5.20732C14.6666 2.78065 13.2199 1.33398 10.7933 1.33398ZM13.5799 8.33398C13.0599 7.88732 12.2199 7.88732 11.6999 8.33398L8.92659 10.714C8.40659 11.1607 7.56659 11.1607 7.04659 10.714L6.81992 10.5273C6.34659 10.114 5.59325 10.074 5.05992 10.434L2.56659 12.1073C2.41992 11.734 2.33325 11.3007 2.33325 10.794V5.20732C2.33325 3.32732 3.32659 2.33398 5.20659 2.33398H10.7933C12.6733 2.33398 13.6666 3.32732 13.6666 5.20732V8.40732L13.5799 8.33398Z"
        fill="#FF2099"
      />
    </svg>
  );
}

function PromptVariableButton({
  name,
  icon,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      className="text-light-40 flex flex-row items-center space-x-2 hover:bg-light-20 rounded-md px-2 py-1 hover:cursor-pointer"
      onClick={onClick}
    >
      <div>{icon}</div>
      <div>{name}</div>
    </div>
  );
}

export default function AppScreen() {
  const [prompt, setPrompt] = useState("");

  const onVariableClick = (variable: string) => {
    setPrompt((prev) => prev + variable);
  };

  return (
    <>
      <div className="flex flex-row space-x-4 pb-3 py-3 ">
        <PromptVariableButton
          name="Image"
          icon={<ImageIcon />}
          onClick={() => onVariableClick("{{image}}")}
        />
        <PromptVariableButton
          name="Screen"
          icon={<ScreenIcon />}
          onClick={() => onVariableClick("{{screen}}")}
        />
        <PromptVariableButton
          name="Audio"
          icon={<AudioIcon />}
          onClick={() => onVariableClick("{{audio}}")}
        />
        <PromptVariableButton
          name="About Me"
          icon={<PersonIcon />}
          onClick={() => onVariableClick("{{about_me}}")}
        />
      </div>
      <div>
        <CodeEditor
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          language="handlebars"
          placeholder="Describe what you want your app to do in detail."
          className="bg-transparent text-white text-lg"
        />
      </div>
    </>
  );
}
