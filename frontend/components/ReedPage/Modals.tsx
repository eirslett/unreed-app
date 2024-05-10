import { useId, useState } from 'react';
import { Modal, ModalBottom } from '../Modal/Modal';
import { Textarea } from '../Textarea/Textarea';
import { Button } from '../Button/Button';
import { LogEntry } from '../../types';

export function AddCommentModal({
  isOpen,
  closeModal,
  onSubmit,
}: {
  isOpen: boolean;
  closeModal(): void;
  onSubmit(entry: { comment: string }): void;
}) {
  const [comment, setComment] = useState('');
  const id = useId();
  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <form
        id={id}
        onSubmit={(ev) => {
          ev.preventDefault();
          onSubmit({ comment });
          setComment('');
          closeModal();
        }}
      >
        <Textarea autoFocus value={comment} onChange={(ev) => setComment(ev.target.value)} />
      </form>
      <ModalBottom>
        <Button variant="primary" form={id}>
          Save
        </Button>
      </ModalBottom>
    </Modal>
  );
}
