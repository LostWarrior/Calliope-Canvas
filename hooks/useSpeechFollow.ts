import { useCallback, useEffect, useRef, useState } from 'react';

import { getRecognitionDecision, normalizeTranscript } from '../speechFollowBehavior';
import type { FinalSpeechRecognitionResult } from './useSpeechRecognition';
import type { SlideDefinition, VoiceAction } from '../types';

const SPEECH_FOLLOW_STORAGE_KEY = 'calliope-canvas:speech-follow-enabled';

interface AutoAdvance {
  cue: string;
  fromSlide: number;
  timestamp: number;
  toSlide: number;
  transcript: string;
}

interface UseSpeechFollowOptions {
  commandHandlers: Record<VoiceAction, () => void>;
  currentSlide: number;
  isMatchingBlocked: boolean;
  isRecognitionAvailable: boolean;
  onGoToSlide: (slideIndex: number) => void;
  slides: SlideDefinition[];
}

const getStoredEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SPEECH_FOLLOW_STORAGE_KEY) === 'true';
};

export const useSpeechFollow = ({
  commandHandlers,
  currentSlide,
  isMatchingBlocked,
  isRecognitionAvailable,
  onGoToSlide,
  slides,
}: UseSpeechFollowOptions) => {
  const [isSpeechFollowEnabled, setIsSpeechFollowEnabled] = useState(getStoredEnabled);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [lastAutoAdvance, setLastAutoAdvance] = useState<AutoAdvance | null>(null);
  const [isLastAutoAdvanceUndone, setIsLastAutoAdvanceUndone] = useState(false);
  const currentSlideRef = useRef(currentSlide);
  const optionsRef = useRef({
    commandHandlers,
    isMatchingBlocked,
    isRecognitionAvailable,
    onGoToSlide,
    slides,
  });
  const lastAutoAdvanceAtRef = useRef<number | null>(null);
  const lastAutoAdvanceResultIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
    optionsRef.current = {
      commandHandlers,
      isMatchingBlocked,
      isRecognitionAvailable,
      onGoToSlide,
      slides,
    };
  }, [commandHandlers, currentSlide, isMatchingBlocked, isRecognitionAvailable, onGoToSlide, slides]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SPEECH_FOLLOW_STORAGE_KEY, String(isSpeechFollowEnabled));
    }
  }, [isSpeechFollowEnabled]);

  const onFinalRecognitionResult = useCallback((result: FinalSpeechRecognitionResult) => {
    const normalizedAlternatives = result.alternatives.map(alternative => normalizeTranscript(alternative.transcript));
    const normalizedTranscript = normalizedAlternatives[0] ?? '';
    setLastHeard(result.transcript);

    const {
      isMatchingBlocked: blocked,
      isRecognitionAvailable,
      onGoToSlide: navigate,
      slides: currentSlides,
    } = optionsRef.current;
    const fromSlide = currentSlideRef.current;
    const decision = getRecognitionDecision(normalizedAlternatives, {
      confidence: result.confidence,
      currentSlide: fromSlide,
      enabled: isSpeechFollowEnabled,
      isMatchingBlocked: blocked || !isRecognitionAvailable,
      lastAutoAdvanceAt: lastAutoAdvanceAtRef.current,
      lastAutoAdvanceResultId: lastAutoAdvanceResultIdRef.current,
      nextSlideCues: currentSlides[fromSlide + 1]?.speech?.cues,
      normalizedTranscript,
      now: Date.now(),
      resultId: result.resultId,
      slideCount: currentSlides.length,
    });

    if (decision.type === 'command') {
      setLastCommand(decision.command.label);
      optionsRef.current.commandHandlers[decision.command.action]();
      return;
    }

    if (decision.type !== 'auto-advance' || !('cue' in decision) || !('toSlide' in decision)) return;

    const autoAdvance: AutoAdvance = {
      cue: decision.cue,
      fromSlide,
      timestamp: Date.now(),
      toSlide: decision.toSlide,
      transcript: result.transcript,
    };
    lastAutoAdvanceAtRef.current = autoAdvance.timestamp;
    lastAutoAdvanceResultIdRef.current = result.resultId;
    setLastAutoAdvance(autoAdvance);
    setIsLastAutoAdvanceUndone(false);
    navigate(autoAdvance.toSlide);
  }, [isSpeechFollowEnabled]);

  const undoAutoAdvance = useCallback(() => {
    if (!lastAutoAdvance || currentSlideRef.current !== lastAutoAdvance.toSlide) return;
    optionsRef.current.onGoToSlide(lastAutoAdvance.fromSlide);
    setIsLastAutoAdvanceUndone(true);
  }, [lastAutoAdvance]);

  return {
    canUndoAutoAdvance: Boolean(
      lastAutoAdvance && !isLastAutoAdvanceUndone && currentSlide === lastAutoAdvance.toSlide
    ),
    isSpeechFollowEnabled,
    lastAutoAdvance,
    lastCommand,
    lastHeard,
    onFinalRecognitionResult,
    setIsSpeechFollowEnabled,
    undoAutoAdvance,
  };
};
