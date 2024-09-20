import { Button } from '@/components/ui/button'

interface EnableConversationsButtonProps {
  onClick?: () => void
}

export default function EnableConversationsButton({ onClick }: EnableConversationsButtonProps) {
  return (
    <Button
      className="h-6 w-36 bg-[rgba(255,255,255,0.08)] px-2 text-xs font-normal text-[rgba(180,180,180,1)] hover:bg-[rgba(255,255,255,0.12)]"
      onClick={onClick}
    >
      Button
    </Button>
  )
}
