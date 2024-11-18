import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/components/catalyst/alert'
import { Button } from '@/components/catalyst/button'
import { useStore } from '@/components/providers/store-provider'

export default function ErrorModal() {
  const { errorModalOpen, errorModalMessage, setErrorModalOpen } = useStore((state) => ({
    errorModalOpen: state.errorModalOpen,
    errorModalMessage: state.errorModalMessage,
    setErrorModalOpen: state.setErrorModalOpen,
  }))

  return (
    <Alert open={errorModalOpen} onClose={setErrorModalOpen}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorModalMessage}</AlertDescription>
      <AlertActions>
        <Button plain onClick={() => setErrorModalOpen(false)}>
          Close
        </Button>
      </AlertActions>
    </Alert>
  )
}
