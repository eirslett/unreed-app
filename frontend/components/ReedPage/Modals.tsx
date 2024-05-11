import { useId, useRef, useState } from 'react';
import { Modal, ModalBottom } from '../Modal/Modal';
import { Textarea } from '../Textarea/Textarea';
import { Button } from '../Button/Button';
import { LogEntry } from '../../types';
import { Field, Input } from '../Form/Form';

export function AddCommentModal({
  isOpen,
  closeModal,
  onSubmit,
}: {
  isOpen: boolean;
  closeModal(): void;
  onSubmit(entry: { comment: string }): void;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={() => {
        formRef.current?.reset();
        closeModal();
      }}
    >
      <form
        id={id}
        ref={formRef}
        method="dialog"
        onSubmit={(ev) => {
          if (formRef.current != null) {
            const data = new FormData(formRef.current);
            const comment: string = String(data.get('comment'));
            formRef.current.reset();
            onSubmit({ comment });
          }
        }}
      >
        <Textarea name="comment" autoFocus />
      </form>
      <ModalBottom>
        <Button variant="primary" form={id}>
          Save
        </Button>
      </ModalBottom>
    </Modal>
  );
}

export function PlayedReedModal({
  isOpen,
  closeModal,
  onSubmit,
}: {
  isOpen: boolean;
  closeModal(): void;
  onSubmit(entry: { duration: string; comment: string }): void;
}) {
  const [comment, setComment] = useState('');
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={() => {
        formRef.current?.reset();
        closeModal();
      }}
    >
      <form
        id={id}
        ref={formRef}
        method="dialog"
        onSubmit={(ev) => {
          if (formRef.current != null) {
            const data = new FormData(formRef.current);
            const duration = String(data.get('duration'));
            const comment = String(data.get('comment'));
            formRef.current.reset();
            onSubmit({ duration, comment });
          }
        }}
      >
        <Field>
          <label htmlFor="duration">For how long (approximately)?</label>
          <Input
            autoFocus
            type="text"
            name="duration"
            placeholder="10 min, 30 min..."
            defaultValue=""
          />
        </Field>
        <Field>
          <label className="label" htmlFor="comment">
            How was the reed?
          </label>
          <Textarea name="comment" defaultValue="" />
        </Field>
      </form>
      <ModalBottom>
        <Button variant="primary" form={id}>
          Save
        </Button>
      </ModalBottom>
    </Modal>
  );
}

const scrapedReedPlaceholder =
  'Did you scrape by hand? With a profiling machine? Which machine? Which template? Which settings?';

export function ScrapedReedModal({
  isOpen,
  closeModal,
  onSubmit,
}: {
  isOpen: boolean;
  closeModal(): void;
  onSubmit(entry: { comment: string }): void;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={() => {
        formRef.current?.reset();
        closeModal();
      }}
    >
      <form
        id={id}
        ref={formRef}
        method="dialog"
        onSubmit={(ev) => {
          if (formRef.current != null) {
            const data = new FormData(formRef.current);
            const comment: string = String(data.get('comment'));
            formRef.current.reset();
            onSubmit({ comment });
          }
        }}
      >
        <Textarea name="comment" autoFocus placeholder={scrapedReedPlaceholder} />
      </form>
      <ModalBottom>
        <Button variant="primary" form={id}>
          Save
        </Button>
      </ModalBottom>
    </Modal>
  );
}

export function ClippedTipModal({
  isOpen,
  closeModal,
  onSubmit,
}: {
  isOpen: boolean;
  closeModal(): void;
  onSubmit(entry: { length: string }): void;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={() => {
        formRef.current?.reset();
        closeModal();
      }}
    >
      <form
        id={id}
        ref={formRef}
        method="dialog"
        onSubmit={() => {
          if (formRef.current != null) {
            const data = new FormData(formRef.current);
            const length = String(data.get('length'));
            formRef.current.reset();
            onSubmit({ length });
          }
        }}
      >
        <Field>
          <label htmlFor="length">New length</label>
          <Input autoFocus type="text" name="length" placeholder="71 mm, 72 mm..." />
        </Field>
      </form>
      <ModalBottom>
        <Button variant="primary" form={id}>
          Save
        </Button>
      </ModalBottom>
    </Modal>
  );
}

export function DiscardModal({
  isOpen,
  closeModal,
  onSubmit,
}: {
  isOpen: boolean;
  closeModal(): void;
  onSubmit(): void;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <form
        id={id}
        ref={formRef}
        method="dialog"
        onSubmit={() => {
          onSubmit();
        }}
      >
        <p>Are you sure you want to discard this reed?</p>
      </form>
      <ModalBottom>
        <Button variant="warning" form={id}>
          Discard
        </Button>
        <Button variant="secondary" type="button" onClick={closeModal}>
          Cancel
        </Button>
      </ModalBottom>
    </Modal>
  );
}
