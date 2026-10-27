export type TranscriptEntry = { slide: number; text: string; timestamp: number };

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

export const formatTranscript = (entries: TranscriptEntry[], slides: { title?: string }[]) => {
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

export const getTranscriptFileName = (date: Date) =>
  `calliope-transcript-${formatDate(date)}-${pad(date.getHours())}${pad(date.getMinutes())}.txt`;
