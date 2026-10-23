import React from 'react';
import { MyNotesModal } from './MyNotesModal';

export { MyNotesModal };

export interface SunnyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
}

export const SunnyNotesModal: React.FC<SunnyNotesModalProps> = (props) => {
  return <MyNotesModal {...props} />;
};

export default SunnyNotesModal;

