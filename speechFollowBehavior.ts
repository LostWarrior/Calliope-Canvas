import { matchVoiceCommand } from './presentationBehavior.ts';

export const SPEECH_FOLLOW_MIN_CONFIDENCE = 0.7;
export const SPEECH_FOLLOW_MIN_SCORE = 0.75;
export const SPEECH_FOLLOW_COOLDOWN_MS = 3000;

export const normalizeTranscript = (transcript: string) =>
  transcript
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const scoreCue = (normalizedTranscript: string, normalizedCue: string) => {
  if (!normalizedTranscript || !normalizedCue) {
    return 0;
  }

  if (normalizedTranscript.includes(normalizedCue)) {
    return 1;
  }

  const transcriptTokens = new Set(normalizedTranscript.split(' '));
  const cueTokens = normalizedCue.split(' ');
  const matchedTokens = cueTokens.filter(token => transcriptTokens.has(token)).length;

  return matchedTokens / cueTokens.length;
};

export const getBestCueMatch = (normalizedTranscript: string, cues: string[]) =>
  cues.reduce<{ cue: string | null; score: number }>(
    (bestMatch, cue) => {
      const score = scoreCue(normalizedTranscript, normalizeTranscript(cue));

      return score > bestMatch.score ? { cue, score } : bestMatch;
    },
    { cue: null, score: 0 }
  );

export type SpeechFollowInput = {
  enabled: boolean;
  isMatchingBlocked: boolean;
  currentSlide: number;
  slideCount: number;
  nextSlideCues?: string[];
  normalizedTranscript: string;
  confidence: number;
  cooldownMs?: number;
  now: number;
  lastAutoAdvanceAt: number | null;
  lastAutoAdvanceResultId: string | null;
  resultId: string;
};

export const getSpeechFollowDecision = (input: SpeechFollowInput) => {
  if (!input.enabled) return { shouldAdvance: false, reason: 'disabled' };
  if (input.isMatchingBlocked) return { shouldAdvance: false, reason: 'blocked' };
  if (input.currentSlide >= input.slideCount - 1) return { shouldAdvance: false, reason: 'end-of-deck' };
  if (input.resultId === input.lastAutoAdvanceResultId) {
    return { shouldAdvance: false, reason: 'duplicate' };
  }
  if (
    input.lastAutoAdvanceAt !== null &&
    input.now - input.lastAutoAdvanceAt < (input.cooldownMs ?? SPEECH_FOLLOW_COOLDOWN_MS)
  ) {
    return { shouldAdvance: false, reason: 'cooldown' };
  }
  if (input.confidence < SPEECH_FOLLOW_MIN_CONFIDENCE) {
    return { shouldAdvance: false, reason: 'low-confidence' };
  }

  const match = getBestCueMatch(input.normalizedTranscript, input.nextSlideCues ?? []);
  if (match.score < SPEECH_FOLLOW_MIN_SCORE || !match.cue) {
    return { shouldAdvance: false, reason: 'no-match' };
  }

  return {
    shouldAdvance: true,
    cue: match.cue,
    score: match.score,
    toSlide: input.currentSlide + 1,
  };
};

export const getRecognitionDecision = (normalizedAlternatives: string[], speechFollowInput: SpeechFollowInput) => {
  const command = matchVoiceCommand(normalizedAlternatives);
  if (command) return { type: 'command', command };

  const speechFollowDecision = getSpeechFollowDecision(speechFollowInput);
  return speechFollowDecision.shouldAdvance
    ? { type: 'auto-advance', ...speechFollowDecision }
    : { type: 'none', ...speechFollowDecision };
};
