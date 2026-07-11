// @ts-check

import { matchVoiceCommand } from './presentationBehavior.js';

export const SPEECH_FOLLOW_MIN_CONFIDENCE = 0.7;
export const SPEECH_FOLLOW_MIN_SCORE = 0.75;
export const SPEECH_FOLLOW_COOLDOWN_MS = 3000;

/**
 * @param {string} transcript
 */
export const normalizeTranscript = transcript =>
  transcript
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * @param {string} normalizedTranscript
 * @param {string} normalizedCue
 */
export const scoreCue = (normalizedTranscript, normalizedCue) => {
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

/**
 * @param {string} normalizedTranscript
 * @param {string[]} cues
 */
export const getBestCueMatch = (normalizedTranscript, cues) =>
  cues.reduce(
    (bestMatch, cue) => {
      const score = scoreCue(normalizedTranscript, normalizeTranscript(cue));

      return score > bestMatch.score ? { cue, score } : bestMatch;
    },
    { cue: null, score: 0 }
  );

/**
 * @typedef {{
 *  enabled: boolean,
 *  isMatchingBlocked: boolean,
 *  currentSlide: number,
 *  slideCount: number,
 *  nextSlideCues?: string[],
 *  normalizedTranscript: string,
 *  confidence: number,
 *  cooldownMs?: number,
 *  now: number,
 *  lastAutoAdvanceAt: number | null,
 *  lastAutoAdvanceResultId: string | null,
 *  resultId: string,
 * }} SpeechFollowInput
 */

/**
 * @param {SpeechFollowInput} input
 */
export const getSpeechFollowDecision = input => {
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

/**
 * @param {string[]} normalizedAlternatives
 * @param {SpeechFollowInput} speechFollowInput
 */
export const getRecognitionDecision = (normalizedAlternatives, speechFollowInput) => {
  const command = matchVoiceCommand(normalizedAlternatives);
  if (command) return { type: 'command', command };

  const speechFollowDecision = getSpeechFollowDecision(speechFollowInput);
  return speechFollowDecision.shouldAdvance
    ? { type: 'auto-advance', ...speechFollowDecision }
    : { type: 'none', ...speechFollowDecision };
};
