import { ModalObjectProps } from "@/types";
import Modal from "@/components/modals/Modal";
import CreatePromptForm from "@/components/prompts/CreatePromptForm/CreatePromptForm";
import { useStore } from "@/providers/store-provider";
import NewPromptForm from "@/components/prompts/NewPromptForm/NewPromptForm";

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const closeModal = useStore((state) => state.closeModal);
  return (
    <Modal id={id} size={"fullscreen"} header={"Create New Highlight App"}>
      <NewPromptForm />
    </Modal>
  );
};

export default CreatePromptModal;
