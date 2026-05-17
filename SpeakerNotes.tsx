import type { SlideDefinition } from './types';
import { slides, clampSlideIndex } from './App';
import React, { useEffect, useRef, useState } from 'react';
export const SPEAKER_NOTES_CHANNEL = 'calliope-canvas-speaker-notes';
export const SPEAKER_NOTES_QUERY_PARAM = 'speaker-notes';


type SpeakerNotesStateMessage = {
    currentSlide: number;
    type: 'speaker-notes-state';
};

type SpeakerNotesRequestMessage = {
    type: 'speaker-notes-request-state';
};

type SpeakerNotesSetSlideMessage = {
    currentSlide: number;
    type: 'speaker-notes-set-slide';
};

type SpeakerNotesMessage =
    | SpeakerNotesStateMessage
    | SpeakerNotesRequestMessage
    | SpeakerNotesSetSlideMessage;

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
    );
};

export const postSpeakerNotesState = (
    channel: BroadcastChannel | null,
    currentSlide: number
) => {
    channel?.postMessage({
        currentSlide,
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

const getSlideNotes = (slide: SlideDefinition) =>
    slide.notes?.length ? slide.notes : ['No speaker notes for this slide.'];

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
        <div className="min-h-screen bg-slate-950 px-6 py-8 font-sans text-slate-100">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <header className="flex flex-col gap-4 border-b border-slate-800 pb-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={goToPrev}
                                disabled={currentSlide === 0}
                                className="px-3 py-1.5 text-sm bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-slate-400 font-mono">
                                {currentSlide + 1} / {slides.length}
                            </span>
                            <button
                                onClick={goToNext}
                                disabled={currentSlide === slides.length - 1}
                                className="px-3 py-1.5 text-sm bg-sky-600 rounded-md text-white font-semibold hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                        <div className={`flex items-center gap-2 text-sm font-semibold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                            {isConnected ? 'Connected to deck' : 'Waiting for deck'}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                            Speaker Notes
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-white">
                            {currentSlideDefinition.title}
                        </h1>
                    </div>
                </header>

                <main className="grid gap-6 lg:grid-cols-[1fr_18rem]">
                    <section className="rounded-lg border border-slate-800 bg-slate-900 px-7 py-6">
                        <h2 className="text-xl font-semibold text-white">Notes</h2>
                        <ul className="mt-5 space-y-4 text-xl leading-relaxed text-slate-200">
                            {getSlideNotes(currentSlideDefinition).map((note, index) => (
                                <li key={index}>{renderSpeakerNote(note)}</li>
                            ))}
                        </ul>
                    </section>

                    <aside className="flex flex-col gap-4">

                        <div className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Next
                            </p>
                            <p className="mt-3 text-lg font-semibold text-slate-100">
                                {nextSlideDefinition ? nextSlideDefinition.title : 'End of deck'}
                            </p>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
};

