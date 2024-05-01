import { useState } from 'react';
import { Modal } from '../Modal/Modal';
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
  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          onSubmit({ comment });
          setComment('');
          closeModal();
        }}
      >
        <Textarea autoFocus value={comment} onChange={(ev) => setComment(ev.target.value)} />
        <Button variant="primary">Save</Button>
      </form>
    </Modal>
  );
}
