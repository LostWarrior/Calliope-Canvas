import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clampSidebarWidth,
  getSidebarMaxWidth,
  getSlideTransitionClass,
  groupSlidesBySection,
  isPresentationShortcutAllowed,
  getHelpShortcutSections,
  matchVoiceCommand,
  parseSidebarWidth,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
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

test('groups consecutive slides by section', () => {
  assert.deepEqual(
    groupSlidesBySection([{ section: 'Intro' }, { section: 'Intro' }, { section: 'Indexes' }, {}]),
    [
      { section: 'Intro', slideIndexes: [0, 1] },
      { section: 'Indexes', slideIndexes: [2] },
      { section: undefined, slideIndexes: [3] },
    ],
  );
});

test('keeps a flat list as one unnamed group', () => {
  assert.deepEqual(groupSlidesBySection([{}, {}]), [{ section: undefined, slideIndexes: [0, 1] }]);
});

test('starts a new group when a section repeats after another section', () => {
  assert.deepEqual(
    groupSlidesBySection([{ section: 'A' }, { section: 'B' }, { section: 'A' }]).map(group => group.slideIndexes),
    [[0], [1], [2]],
  );
});

test('returns no groups for an empty deck', () => {
  assert.deepEqual(groupSlidesBySection([]), []);
});

test('clamps sidebar width between the minimum and maximum', () => {
  assert.equal(clampSidebarWidth(100, 1600), SIDEBAR_MIN_WIDTH);
  assert.equal(clampSidebarWidth(320.4, 1600), 320);
  assert.equal(clampSidebarWidth(900, 1600), SIDEBAR_MAX_WIDTH);
});

test('limits sidebar width to half the viewport', () => {
  assert.equal(getSidebarMaxWidth(800), 400);
  assert.equal(clampSidebarWidth(450, 800), 400);
  assert.equal(getSidebarMaxWidth(300), SIDEBAR_MIN_WIDTH);
});

test('reads a stored sidebar width or falls back to the default', () => {
  assert.equal(parseSidebarWidth('320'), 320);
  assert.equal(parseSidebarWidth('9000'), SIDEBAR_MAX_WIDTH);
  assert.equal(parseSidebarWidth(null), SIDEBAR_DEFAULT_WIDTH);
  assert.equal(parseSidebarWidth(''), SIDEBAR_DEFAULT_WIDTH);
  assert.equal(parseSidebarWidth('wide'), SIDEBAR_DEFAULT_WIDTH);
});
