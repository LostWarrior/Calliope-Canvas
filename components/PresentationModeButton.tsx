import React from 'react';
import { PresentationIcon } from './Icons';
import ThemedButton from './ThemedButton';

interface PresentationModeButtonProps {
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
}

const PresentationModeButton: React.FC<PresentationModeButtonProps> = ({ isPresentationMode, togglePresentationMode }) => (
  <ThemedButton
    data-deck-chrome=""
    onClick={togglePresentationMode}
    variant={isPresentationMode ? 'primary' : 'ghost'}
    title="Toggle presentation mode (P)"
    aria-pressed={isPresentationMode}
    className="fixed top-4 right-4 z-30"
  >
    <PresentationIcon className="h-5 w-5" />
  </ThemedButton>
);

export default PresentationModeButton;
