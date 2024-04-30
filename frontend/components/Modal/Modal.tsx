import { useEffect, useRef } from 'react';

export type ModalProps = {
  children?: React.ReactNode;
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
    const dialog = ref.current;
    if (dialog) {
      dialog.showModal();
    }
  }, [ref]);

  function closeModal() {
    const dialog = ref.current;
    if (dialog) {
      dialog.close();
    }
  }

  return (
    <dialog ref={ref} className="dialog">
      <div className="dialog__top">
        <button className="dialog__close-button" onClick={closeModal} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <div>{props.children}</div>
    </dialog>
  );
}
