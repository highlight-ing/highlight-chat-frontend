import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

export default function LoadingModal() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size="25px" color="white" /> Loading...
    </div>
  )
}
