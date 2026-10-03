import test from 'node:test';
import assert from 'node:assert/strict';

import { formatTranscript, getTranscriptFileName } from './transcript.js';

const slides = [{ title: 'Welcome' }, { title: 'Pricing' }];
const at = (hours, minutes, seconds) => new Date(2026, 9, 3, hours, minutes, seconds).getTime();

test('formats one line per entry with time and slide number', () => {
  const text = formatTranscript(
    [
      { slide: 0, text: 'Hello everyone', timestamp: at(10, 2, 14) },
      { slide: 1, text: 'Here is pricing', timestamp: at(10, 3, 5) },
    ],
    slides
  );

  assert.equal(
    text,
    'Calliope Canvas transcript, 2026-10-03\n\n'
      + '[10:02:14] Slide 1 (Welcome): Hello everyone\n'
      + '[10:03:05] Slide 2 (Pricing): Here is pricing\n'
  );
});

test('falls back to the slide number when a slide has no title', () => {
  const text = formatTranscript([{ slide: 4, text: 'Extra', timestamp: at(9, 0, 0) }], slides);
  assert.match(text, /\[09:00:00\] Slide 5: Extra/);
});

test('handles an empty transcript', () => {
  assert.equal(formatTranscript([], slides), 'Calliope Canvas transcript\n\n');
});

test('names the file with date and time', () => {
  assert.equal(getTranscriptFileName(new Date(2026, 9, 3, 9, 5)), 'calliope-transcript-2026-10-03-0905.txt');
});
