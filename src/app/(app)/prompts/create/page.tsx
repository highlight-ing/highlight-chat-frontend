import TopBar from "@/components/Navigation/TopBar";
import { Button } from "@/components/catalyst/button";
import { Input } from "@/components/catalyst/input";
import { Textarea } from "@/components/catalyst/textarea";

export default function CreatePromptPage() {
  return (
    <div className="h-screen">
      <TopBar />
      <div className="p-4">
        <h1 className="text-2xl">Create Prompt</h1>
        <div className="rounded-md bg-light-8 p-4 border border-light-20">
          <p className="text-light-60">
            Let's create your first Highlight prompt!
          </p>
          <div className="flex flex-col space-y-4 mt-4">
            <Input className="" placeholder="Name" />
            <Textarea placeholder="Description" />
            <Textarea placeholder="Instructions" />
            <Button color="cyan" className="h-10">
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
