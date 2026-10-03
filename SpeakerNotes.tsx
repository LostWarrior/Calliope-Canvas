import type { SlideDefinition } from './types';
import { slides, clampSlideIndex } from './App';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronIcon } from './components/Icons';
import ThemeSelector from './components/ThemeSelector';
import ThemedButton from './components/ThemedButton';
import { useTheme } from './components/ThemeProvider';
import { isThemeName, type ThemeName } from './theme';

export const SPEAKER_NOTES_CHANNEL = 'calliope-canvas-speaker-notes';
export const SPEAKER_NOTES_QUERY_PARAM = 'speaker-notes';


type SpeakerNotesStateMessage = {
    currentSlide: number;
    theme: ThemeName;
    type: 'speaker-notes-state';
};

type SpeakerNotesRequestMessage = {
    type: 'speaker-notes-request-state';
};

type SpeakerNotesSetSlideMessage = {
    currentSlide: number;
    type: 'speaker-notes-set-slide';
};

type SpeakerNotesSetThemeMessage = {
    theme: ThemeName;
    type: 'speaker-notes-set-theme';
};

type SpeakerNotesMessage =
    | SpeakerNotesStateMessage
    | SpeakerNotesRequestMessage
    | SpeakerNotesSetSlideMessage
    | SpeakerNotesSetThemeMessage;

export const isSpeakerNotesRoute = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return new URLSearchParams(window.location.search).get(SPEAKER_NOTES_QUERY_PARAM) === '1';
};

export const isSpeakerNotesMessage = (message: unknown): message is SpeakerNotesMessage => {
    if (!message || typeof message !== 'object') {
        return false;
    }

    const { type } = message as { type?: unknown };
    return (
        type === 'speaker-notes-state'
        || type === 'speaker-notes-request-state'
        || type === 'speaker-notes-set-slide'
        || type === 'speaker-notes-set-theme'
    );
};

export const postSpeakerNotesState = (
    channel: BroadcastChannel | null,
    currentSlide: number,
    theme: ThemeName
) => {
    channel?.postMessage({
        currentSlide,
        theme,
        type: 'speaker-notes-state',
    } satisfies SpeakerNotesStateMessage);
};

export const postSpeakerNotesSlideChange = (
    channel: BroadcastChannel | null,
    currentSlide: number
) => {
    channel?.postMessage({
        currentSlide,
        type: 'speaker-notes-set-slide',
    } satisfies SpeakerNotesSetSlideMessage);
};

export const postSpeakerNotesThemeChange = (
    channel: BroadcastChannel | null,
    theme: ThemeName
) => {
    channel?.postMessage({
        theme,
        type: 'speaker-notes-set-theme',
    } satisfies SpeakerNotesSetThemeMessage);
};

const getSlideNotes = (slide: SlideDefinition) =>
    slide.notes?.length ? slide.notes : ['No speaker notes for this slide.'];

const isStageDirection = (note: React.ReactNode) =>
    typeof note === 'string' && /^\[[^\]]+\]$/.test(note.trim());

const renderSpeakerNote = (note: React.ReactNode) => {
    if (typeof note !== 'string') {
        return note;
    }

    return note.split(/(\[[^\]]+\])/g).map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
            return (
                <em key={`${part}-${index}`} className="italic">
                    {part}
                </em>
            );
        }

        return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    });
};


export const SpeakerNotesView: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { setTheme } = useTheme();
    const speakerNotesChannelRef = useRef<BroadcastChannel | null>(null);
    const currentSlideDefinition = slides[currentSlide];
    const nextSlideDefinition = slides[currentSlide + 1];

    const goToSlide = (slideIndex: number) => {
        const nextSlide = clampSlideIndex(slideIndex);

        setCurrentSlide(nextSlide);
        postSpeakerNotesSlideChange(speakerNotesChannelRef.current, nextSlide);
    };

    const goToNext = () => {
        goToSlide(currentSlide + 1);
    };

    const goToPrev = () => {
        goToSlide(currentSlide - 1);
    };

    const handleThemeChange = (theme: ThemeName) => {
        postSpeakerNotesThemeChange(speakerNotesChannelRef.current, theme);
    };

    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') {
            return undefined;
        }

        const channel = new BroadcastChannel(SPEAKER_NOTES_CHANNEL);
        speakerNotesChannelRef.current = channel;

        channel.onmessage = (event: MessageEvent<unknown>) => {
            if (!isSpeakerNotesMessage(event.data) || event.data.type !== 'speaker-notes-state') {
                return;
            }

            setCurrentSlide(clampSlideIndex(event.data.currentSlide));
            if (isThemeName(event.data.theme)) {
                setTheme(event.data.theme);
            }
            setIsConnected(true);
        };

        channel.postMessage({ type: 'speaker-notes-request-state' } satisfies SpeakerNotesRequestMessage);

        return () => {
            channel.close();

            if (speakerNotesChannelRef.current === channel) {
                speakerNotesChannelRef.current = null;
            }
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-canvas px-4 py-6 font-sans text-text sm:px-6 sm:py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
                <header className="flex flex-col gap-4 border-b border-border pb-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <ThemedButton
                                onClick={goToPrev}
                                disabled={currentSlide === 0}
                                aria-label="Previous slide"
                                title="Previous slide"
                            >
                                <ChevronIcon direction="left" className="h-4 w-4" />
                            </ThemedButton>
                            <span className="whitespace-nowrap font-mono text-sm text-muted">
                                {currentSlide + 1} / {slides.length}
                            </span>
                            <ThemedButton
                                onClick={goToNext}
                                disabled={currentSlide === slides.length - 1}
                                variant="primary"
                                aria-label="Next slide"
                                title="Next slide"
                            >
                                <ChevronIcon direction="right" className="h-4 w-4" />
                            </ThemedButton>
                        </div>
                        <ThemeSelector onThemeChange={handleThemeChange} />
                    </div>
                    <div className="text-center">
                        <p className="pl-[0.3em] text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                            Speaker Notes
                        </p>
                        <h1 className="mt-2 text-lg font-semibold text-text">
                            {currentSlideDefinition.title}
                        </h1>
                    </div>
                </header>

                <main className="grid gap-6 lg:grid-cols-[1fr_18rem]">
                    <section className="min-w-0 rounded-lg border border-border bg-surface px-5 py-5 sm:px-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Notes</h2>
                        <ul className="mt-4 space-y-4 leading-relaxed">
                            {getSlideNotes(currentSlideDefinition).map((note, index) => (
                                <li
                                    key={index}
                                    className={isStageDirection(note) ? 'text-sm text-muted sm:text-base' : 'text-lg text-text sm:text-xl'}
                                >
                                    {renderSpeakerNote(note)}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <aside className="flex flex-col gap-4">
                        <div className="rounded-lg border border-border bg-surface px-5 py-5 sm:px-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                                Next
                            </p>
                            <p className="mt-4 text-lg font-semibold text-text">
                                {nextSlideDefinition ? nextSlideDefinition.title : 'End of deck'}
                            </p>
                        </div>
                    </aside>
                </main>

                <footer
                    role="status"
                    className={`mt-auto flex items-center justify-end gap-2 pt-4 text-sm font-semibold ${isConnected ? 'text-primary' : 'text-muted'}`}
                >
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-primary' : 'bg-accent'}`} />
                    {isConnected ? 'Connected to deck' : 'Waiting for deck'}
                </footer>
            </div>
        </div>
    );
};
