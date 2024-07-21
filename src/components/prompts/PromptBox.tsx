import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";

interface PromptBoxProps {
  name: string;
  description: string;
}

export default function PromptBox({ name, description }: PromptBoxProps) {
  const router = useRouter();

  const { setPrompt, clearPrompt } = useStore((state) => ({
    setPrompt: state.setPrompt,
    clearPrompt: state.clearPrompt,
  }));

  function onClick() {
    if (name === "Highlight Chat") {
      clearPrompt();
      router.push("/");
      return;
    }

    setPrompt({ promptName: name, promptDescription: description });

    router.push("/");
  }

  return (
    <div
      onClick={onClick}
      className="bg-light-10 p-4 rounded-lg hover:bg-light-20 cursor-pointer"
    >
      <h3>{name}</h3>
      <p className="text-sm text-light-60">{description}</p>
    </div>
  );
}
