import TopBar from "@/components/Navigation/TopBar";
import CreatePromptForm from "@/components/prompts/CreatePromptForm/CreatePromptForm";

export default function CreatePromptPage() {
  return (
    <div className="h-screen">
      <TopBar />
      <div className="p-4">
        <h1 className="text-2xl">Create New Prompt</h1>
        <div className="mt-4 rounded-md bg-light-8 p-4 border border-light-20">
          <p className="text-light-60">
            Let's create your first Highlight prompt!
          </p>
          <CreatePromptForm />
        </div>
      </div>
    </div>
  );
}
