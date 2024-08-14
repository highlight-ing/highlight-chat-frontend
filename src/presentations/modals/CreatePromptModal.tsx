import { ModalObjectProps } from "@/types";
import Modal from "@/components/modals/Modal";
import { useStore } from "@/providers/store-provider";
import PromptEditor from "@/components/prompts/PromptEditor/PromptEditor";

const CreatePromptModal = ({ id, context }: ModalObjectProps) => {
  const closeModal = useStore((state) => state.closeModal);

  return (
    <Modal id={id} size={"fullscreen"} header={"Create New Highlight App"}>
      <PromptEditor />
    </Modal>
  );
};

export default CreatePromptModal;
