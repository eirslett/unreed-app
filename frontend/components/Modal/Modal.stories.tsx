import { Modal } from './Modal';

export default {
  title: 'Modal',
};

export function ExampleModal() {
  return <Modal isOpen={true} closeModal={console.log}>This is a test</Modal>;
}
