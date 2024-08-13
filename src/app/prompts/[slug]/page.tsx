import PromptListingPage from "@/components/prompts/PromptListingPage/PromptListingPage";

export default function PromptPage({ params }: { params: { slug: string } }) {
  return (
    <div className="bg-bg-layer-1 min-h-screen">
      <PromptListingPage />
    </div>
  );
}
