import { useEffect, useRef } from 'react';

export type ModalProps = {
  isOpen: boolean;
  children?: React.ReactNode;
  closeModal(): void;
};

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      fill="currentColor"
    >
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export function Modal(props: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (props.isOpen) {
        ref.current.showModal();
      } else {
        ref.current.close();
      }
    }
  }, [props.isOpen]);

  return (
    <dialog ref={ref} className="dialog" onClose={props.closeModal}>
      <div className="dialog__top">
        <button className="dialog__close-button" onClick={props.closeModal} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <div>{props.children}</div>
    </dialog>
  );
}

export function ModalBottom({ children }: { children?: React.ReactNode }) {
  return <div className="dialog__bottom">{children}</div>;
}
