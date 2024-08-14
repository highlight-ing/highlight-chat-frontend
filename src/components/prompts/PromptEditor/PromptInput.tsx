import CodeEditor from "@uiw/react-textarea-code-editor";
import { Gallery, Monitor, Sound, User } from "iconsax-react";

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

/**
 * PromptInput is a component that allows the user to input a prompt with
 * buttons to insert variables into that prompt.
 */
export default function PromptInput({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (prompt: string) => void;
}) {
  const onVariableClick = (variable: string) => {
    onChange?.(value + variable);
  };

  return (
    <>
      <div className="flex flex-row space-x-4 pb-3 py-3 ">
        <PromptVariableButton
          name="Image"
          icon={<Gallery variant="Bold" size={16} color="#FF2099" />}
          onClick={() => onVariableClick("{{image}}")}
        />
        <PromptVariableButton
          name="Screen"
          icon={
            <Monitor variant="Bold" size={16} color="#FF2099" opacity="60%" />
          }
          onClick={() => onVariableClick("{{screen}}")}
        />
        <PromptVariableButton
          name="Audio"
          icon={
            <Sound variant="Bold" size={16} color="#4CEDA0" opacity="60%" />
          }
          onClick={() => onVariableClick("{{audio}}")}
        />
        <PromptVariableButton
          name="About Me"
          icon={<User variant="Bold" size={16} color="#ECFF0C" opacity="60%" />}
          onClick={() => onVariableClick("{{about_me}}")}
        />
      </div>
      <div>
        <CodeEditor
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          language="handlebars"
          placeholder="Describe what you want your app to do in detail."
          className="bg-transparent text-white text-lg"
        />
      </div>
    </>
  );
}
