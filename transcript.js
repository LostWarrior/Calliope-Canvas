// @ts-check

/**
 * @typedef {{ slide: number, text: string, timestamp: number }} TranscriptEntry
 */

/**
 * @param {number} value
 */
const pad = value => String(value).padStart(2, '0');

/**
 * @param {Date} date
 */
const formatDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * @param {Date} date
 */
const formatTime = date => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

/**
 * @param {TranscriptEntry[]} entries
 * @param {{ title?: string }[]} slides
 */
export const formatTranscript = (entries, slides) => {
  const header = entries.length
    ? `Calliope Canvas transcript, ${formatDate(new Date(entries[0].timestamp))}`
    : 'Calliope Canvas transcript';
  const lines = entries.map(entry => {
    const title = slides[entry.slide]?.title;
    const slideLabel = title ? `Slide ${entry.slide + 1} (${title})` : `Slide ${entry.slide + 1}`;
    return `[${formatTime(new Date(entry.timestamp))}] ${slideLabel}: ${entry.text}`;
  });

  return `${[header, '', ...lines].join('\n')}\n`;
};

/**
 * @param {Date} date
 */
export const getTranscriptFileName = date =>
  `calliope-transcript-${formatDate(date)}-${pad(date.getHours())}${pad(date.getMinutes())}.txt`;
