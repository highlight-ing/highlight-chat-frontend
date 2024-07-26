import TopBar from "@/components/Navigation/TopBar";
import { fetchPrompt } from "../../actions";
import EditPromptForm from "@/components/prompts/EditPromptForm/EditPromptForm";
import Link from "next/link";

export const revalidate = 0;

export default async function EditPromptPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch the prompt from the database
  const { prompt, error } = await fetchPrompt(params.slug);

  if (!prompt) {
    return (
      <div>
        <h2 className="text-2xl">
          We couldn't find the prompt <pre>{params.slug}</pre>.
        </h2>
        <Link href="/prompts">Go back to prompts</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl">
          Error fetching prompt, please try again later.
        </h2>
        <Link href="/prompts">Go back to prompts</Link>
      </div>
    );
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
