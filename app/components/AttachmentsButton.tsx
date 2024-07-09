import { PaperclipIcon } from '../icons/icons'

interface AttachmentsButtonProps {
  onClick: () => void
}

export const AttachmentsButton = ({ onClick }: AttachmentsButtonProps) => {
  return (
    <button type="button" onClick={onClick}>
      <PaperclipIcon />
    </button>
  )
}
