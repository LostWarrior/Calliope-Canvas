import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getRecognitionDecision,
  getSpeechFollowDecision,
  normalizeTranscript,
  scoreCue,
} from './speechFollowBehavior.js';

const baseInput = {
  confidence: 0.92,
  currentSlide: 0,
  enabled: true,
  isMatchingBlocked: false,
  lastAutoAdvanceAt: null,
  lastAutoAdvanceResultId: null,
  nextSlideCues: ['system architecture', 'how services connect'],
  normalizedTranscript: 'now lets look at the system architecture',
  now: 10_000,
  resultId: '1:0',
  slideCount: 3,
};

test('normalizes local transcripts and scores phrase concepts', () => {
  assert.equal(normalizeTranscript("Let's discuss system architecture!"), 'lets discuss system architecture');
  assert.equal(scoreCue('lets discuss system architecture', 'system architecture'), 1);
});

test('a deterministic command wins over speech-follow matching', () => {
  const decision = getRecognitionDecision(['next slide'], {
    ...baseInput,
    nextSlideCues: ['next slide'],
    normalizedTranscript: 'next slide',
  });

  assert.equal(decision.type, 'command');
  assert.equal(decision.command.action, 'next');
});

test('advances only to the immediately following slide for a qualifying cue', () => {
  const decision = getSpeechFollowDecision(baseInput);

  assert.equal(decision.shouldAdvance, true);
  assert.equal(decision.toSlide, 1);
  assert.equal(decision.cue, 'system architecture');
});

test('does not follow speech when disabled, uncertain, cooling down, or repeated', () => {
  assert.equal(getSpeechFollowDecision({ ...baseInput, enabled: false }).reason, 'disabled');
  assert.equal(getSpeechFollowDecision({ ...baseInput, confidence: 0.2 }).reason, 'low-confidence');
  assert.equal(getSpeechFollowDecision({ ...baseInput, lastAutoAdvanceAt: 9_000 }).reason, 'cooldown');
  assert.equal(getSpeechFollowDecision({ ...baseInput, lastAutoAdvanceResultId: '1:0' }).reason, 'duplicate');
});

test('does not match unrelated speech or slides without cues', () => {
  assert.equal(getSpeechFollowDecision({ ...baseInput, normalizedTranscript: 'thank you for listening' }).reason, 'no-match');
  assert.equal(getSpeechFollowDecision({ ...baseInput, nextSlideCues: undefined }).reason, 'no-match');
});

test('stops matching while blocked and at the end of the deck', () => {
  assert.equal(getSpeechFollowDecision({ ...baseInput, isMatchingBlocked: true }).reason, 'blocked');
  assert.equal(getSpeechFollowDecision({ ...baseInput, currentSlide: 2 }).reason, 'end-of-deck');
});
