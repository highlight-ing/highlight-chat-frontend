import { useStore } from "@/providers/store-provider";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
} from "@/components/catalyst/alert";
import { Button } from "@/components/catalyst/button";

export default function ErrorModal() {
  const { errorModalOpen, errorModalMessage, setErrorModalOpen } = useStore(
    (state) => ({
      errorModalOpen: state.errorModalOpen,
      errorModalMessage: state.errorModalMessage,
      setErrorModalOpen: state.setErrorModalOpen,
    })
  );

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
  );
}
