import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getSlideTransitionClass,
  isPresentationShortcutAllowed,
  getHelpShortcutSections,
  matchVoiceCommand,
} from './presentationBehavior.js';

test('uses a forward animation class for positive direction', () => {
  assert.equal(getSlideTransitionClass(1), 'slide-transition slide-transition-forward');
});

test('uses a backward animation class for negative direction', () => {
  assert.equal(getSlideTransitionClass(-1), 'slide-transition slide-transition-backward');
});

test('locks presentation shortcuts while help is open', () => {
  assert.equal(isPresentationShortcutAllowed('ArrowRight', false), true);
  assert.equal(isPresentationShortcutAllowed('ArrowRight', true), false);
  assert.equal(isPresentationShortcutAllowed('?', true), true);
  assert.equal(isPresentationShortcutAllowed('Escape', true), true);
});

test('exposes keyboard and voice shortcut sections for the help modal', () => {
  const sections = getHelpShortcutSections();
  assert.equal(sections.length, 2);
  assert.equal(sections[0].title, 'Keyboard shortcuts');
  assert.equal(sections[1].title, 'Voice commands');
  assert.ok(sections[1].items.some(item => item.shortcut.startsWith('Auto advance')));
});

test('matches voice commands exactly', () => {
  assert.equal(matchVoiceCommand(['next slide please'])?.action, 'next');
  assert.equal(matchVoiceCommand(['go back'])?.action, 'previous');
});

test('corrects commonly misheard command words', () => {
  assert.equal(matchVoiceCommand(['next light please'])?.action, 'next');
  assert.equal(matchVoiceCommand(['next flight'])?.action, 'next');
  assert.equal(matchVoiceCommand(['previews slide'])?.action, 'previous');
});

test('checks every recognition alternative', () => {
  assert.equal(matchVoiceCommand(['next lied please', 'next slide please'])?.action, 'next');
});

test('ignores misheard words inside normal speech', () => {
  assert.equal(matchVoiceCommand(['the next light']), undefined);
  assert.equal(matchVoiceCommand(['turn on the light']), undefined);
});
