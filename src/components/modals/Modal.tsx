import type { ModalProps } from "./BaseModal";
import { PropsWithChildren } from "react";
import BaseModal from "./BaseModal";
import { useStore } from "@/providers/store-provider";

const Modal = (props: PropsWithChildren<ModalProps>) => {
  const closeModal = useStore((state) => state.closeModal);
  return (
    <BaseModal {...props} closeModal={closeModal} header={<h1>Test</h1>}>
      {props.children}
    </BaseModal>
  );
};

export default Modal;
