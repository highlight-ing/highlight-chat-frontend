import TopBar from "@/components/Navigation/TopBar";
import { fetchPrompt } from "../../actions";
import EditPromptForm from "@/components/prompts/EditPromptForm/EditPromptForm";

export default async function EditPromptPage({
  params,
}: {
  params: { slug: string };
}) {
  console.log("slug", params.slug);

  // Fetch the prompt from the database
  const { prompt, error } = await fetchPrompt(params.slug);

  if (!prompt) {
    return <div>Prompt not found</div>;
  }

  return (
    <div className="h-screen">
      <TopBar />
      <div className="p-4">
        <h1 className="text-2xl">Edit Prompt</h1>
        <div className="mt-4 rounded-md bg-light-8 p-4 border border-light-20">
          <EditPromptForm slug={params.slug} initialData={prompt} />
        </div>
      </div>
    </div>
  );
}
