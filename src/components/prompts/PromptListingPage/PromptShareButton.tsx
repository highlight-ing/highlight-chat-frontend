"use client";

import Button from "@/components/Button/Button";

export default function PromptShareButton() {
  function onShareClick() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <Button onClick={onShareClick} size="small" variant="tertiary">
      Share
    </Button>
  );
}
