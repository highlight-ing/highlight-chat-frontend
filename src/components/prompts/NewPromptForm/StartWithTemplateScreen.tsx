import clsx from "clsx";
import { EmojiHappy, Personalcard, Setting, User } from "iconsax-react";

function TemplateCard({
  title,
  description,
  icon,
  color,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "purple" | "blue" | "pink" | "inherit";
  onClick?: () => void;
}) {
  return (
    <div
      className={clsx(
        `flex flex-col hover:cursor-pointer rounded-3xl text-white items-center text-center p-4`,
        "transition-all duration-150",
        "basis-1/4",
        color === "inherit" && "border border-light-10 ",
        color === "purple" && "bg-[#712FFF]/20 hover:bg-[#712FFF]/30",
        color === "blue" && "bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30",
        color === "pink" && "bg-[#FF2099]/20 hover:bg-[#FF2099]/30"
      )}
      onClick={onClick}
    >
      <div>{icon}</div>
      <h6 className="mt-2 text-base">{title}</h6>
      <p className="text-sm">{description}</p>
    </div>
  );
}

export default function StartWithTemplateScreen() {
  function onSelectTemplate(template: string) {
    console.log(template);
  }

  return (
    <>
      <h4 className="text-white">Start with a template</h4>
      <div className="flex gap-3 mt-8">
        <TemplateCard
          title="Code Reviewer"
          description="Create any kind of personality to have conversations with"
          icon={<User variant="Bold" color="#712FFF" />}
          color="purple"
          onClick={() => onSelectTemplate("code-reviewer")}
        />
        <TemplateCard
          title="Review Responder"
          description="Make the ultimate companion to help you get things done"
          icon={<Personalcard variant="Bold" color="#00F0FF" />}
          color="blue"
          onClick={() => onSelectTemplate("review-responder")}
        />
        <TemplateCard
          title="Elon Musk"
          description="Bring your imagination to life with an AI you can talk to"
          icon={<EmojiHappy variant="Bold" color="#FF2099" />}
          color="pink"
          onClick={() => onSelectTemplate("elon-musk")}
        />
        <TemplateCard
          title="Custom"
          description="Start from scratch"
          icon={<Setting variant="Bold" />}
          color="inherit"
          onClick={() => onSelectTemplate("custom")}
        />
      </div>
    </>
  );
}
