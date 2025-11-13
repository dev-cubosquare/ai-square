"use client";

import type { ChatStatus, UIMessage } from "ai";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { MotionValue } from "motion/react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { type PointerEvent as ReactPointerEvent, useCallback, useState, useEffect, useRef } from "react";

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// ✅ Convert 16-bit signed PCM → WAV (16 kHz, mono, little-endian)
// Note: backend / microphone capture uses 16kHz in this app, so the WAV header must match.
function pcmToWav(pcmData: ArrayBuffer): ArrayBuffer {
  const numOfChannels = 1;
  const sampleRate = 16000;
  const bitsPerSample = 16;

  const byteRate = (sampleRate * numOfChannels * bitsPerSample) / 8;
  const blockAlign = (numOfChannels * bitsPerSample) / 8;
  const dataSize = pcmData.byteLength;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));

  return buffer;
}

import { Suggestions } from "./components/suggestion";
import PopupHeader from "./components/popup-header";
import { PromptInputInput } from "./components/prompt-input-simple";
import { Button } from "../../ui/button";
import {
  LoaderCircle,
  StopCircle,
  Mic,
  Headphones,
  RefreshCw,
  X,
} from 'lucide-react';

import { FloatingAssistantMessageList } from "./assistant-message-list";
import { AssistantSettingsMenu } from "./assistant-settings-menu";
import type { DragConstraints } from "./use-floating-assistant-state";
import { SquareAILogo } from "./components/square-ai-logo";

const panelVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 28,
    },
  },
};

export type PromptInputMessage = {
  text?: string;
  files?: File[];
};

interface FloatingAssistantPanelProps {
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  isMobile: boolean;
  isReady: boolean;
  messages: UIMessage[];
  onClose: () => void;
  onPromptSubmit: (message: PromptInputMessage) => void;
  onQuickSend: (prompt: string) => void;
  open: boolean;
  panelDragProps: {
    drag: boolean;
    dragConstraints: DragConstraints;
    dragElastic: number;
    dragMomentum: boolean;
    dragTransition: {
      bounceDamping: number;
      bounceStiffness: number;
    };
  };
  status: ChatStatus;
  suggestions: string[];
  audioResponseRef?: React.MutableRefObject<{
    requestAudio: () => void;
  } | null>;
  isAudioResponseEnabled?: boolean;
  onAudioResponseToggle?: (enabled: boolean) => void;
}

export function FloatingAssistantPanel({
  cardX,
  cardY,
  isReady,
  messages,
  onClose,
  onPromptSubmit,
  onQuickSend,
  open,
  panelDragProps,
  status,
  suggestions,
  isMobile,
  audioResponseRef,
  isAudioResponseEnabled = false,
  onAudioResponseToggle,
}: FloatingAssistantPanelProps) {
  const dragControls = useDragControls();
  
  // ActionBox state
  const [showWaveform, setShowWaveform] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState('');

  // WebSocket voice streaming state
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<string>('Ready to stream');
  const [totalChunksSent, setTotalChunksSent] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [capturedText, setCapturedText] = useState('');
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Store raw PCM ArrayBuffers converted from incoming chunks
  // We'll concatenate them and build a single WAV at playback time.
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  // Keep a ref to the current playing HTMLAudioElement so we can abort/stop it
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  // Timeout ref to detect end-of-stream and trigger playback
  const audioPlayTimeoutRef = useRef<number | null>(null);
  // UI-visible count of received WAV chunks (keeps UI reactive)
  const [audioChunksCount, setAudioChunksCount] = useState(0);

  // Use refs for immediate control that persists across renders
  const streamingActiveRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const handleHeaderPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!panelDragProps.drag) return;
      if ((event.target as HTMLElement | null)?.closest("button")) return;
      event.preventDefault();
      dragControls.start(event);
    },
    [dragControls, panelDragProps.drag],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("message") as string;

    if (!text?.trim()) return;

    // Stop any playing TTS voice when user submits new text
    abortAudioResponse();

    onPromptSubmit({ text });
    e.currentTarget.reset();
  };

  // ActionBox functions
  const handleCancelStream = async () => {
    setIsStreaming(false);
  };

  const handleRefreshChat = () => {
    localStorage.removeItem('threadId');
    window.location.reload();
    alert('Chat refreshed!');
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => {
          setShowWaveform(true);
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript + interimTranscript);

          // Auto-submit when speech is final and not empty
          if (finalTranscript.trim()) {
            onPromptSubmit({ text: finalTranscript.trim() });
            handleStopRecording();
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access and try again.');
          } else {
            alert(`Speech recognition error: ${event.error}`);
          }
          handleStopRecording();
        };

        recognitionInstance.onend = () => {
          setShowWaveform(false);
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [onPromptSubmit]);

  const handleStartRecording = async () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream since we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Now start speech recognition
      setIsRecording(true);
      setTranscript('');
      recognition.start();
    } catch (error) {
      console.error('Microphone permission error:', error);
      const err = error as DOMException;
      if (err.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found. Please check your microphone connection.');
      } else {
        alert('Error accessing microphone. Please try again.');
      }
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
    setShowWaveform(false);
    setIsRecording(false);
    setShowVoiceDialog(false);
    setTranscript('');
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Audio Response Functions

  const playAudioResponse = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn('⚠️ No audio to play');
      return;
    }

    // Concatenate all PCM ArrayBuffers into one
    const totalBytes = audioChunksRef.current.reduce((sum, buf) => sum + buf.byteLength, 0);
    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const buf of audioChunksRef.current) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    // Build a single WAV buffer from the combined PCM
    const wavBuffer = pcmToWav(combined.buffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(wavBlob);

    const audio = new Audio(url);
    // Store ref so playback can be interrupted
    currentAudioRef.current = audio;

    // Diagnostic: show visibility state

    audio.onerror = (err) => {
      console.error(' Audio playback error:', err);
    };

    await audio.play().catch(err => {
      console.error(' Unable to play WAV:', err);
    });

    audio.onended = () => {
      URL.revokeObjectURL(url);
      // Clear stored PCM chunks after playback
      audioChunksRef.current = [];
      setAudioChunksCount(0);
      // Clear current audio ref
      currentAudioRef.current = null;
    };
  }, []);

  // Abort/stop any currently playing audio response
  const abortAudioResponse = useCallback(() => {
    console.log(' abortAudioResponse called - stopping TTS voice');
    
    // Stop HTMLAudio playback if exists
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        if (currentAudioRef.current.src && currentAudioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(currentAudioRef.current.src);
        }
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
      currentAudioRef.current = null;
    }

    // Clear stored chunks and any pending playback timer
    audioChunksRef.current = [];
    setAudioChunksCount(0);
    if (audioPlayTimeoutRef.current) {
      window.clearTimeout(audioPlayTimeoutRef.current);
      audioPlayTimeoutRef.current = null;
    }

    console.log('Audio stopped successfully');
  }, []);

  const requestAudioResponse = useCallback(() => {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not available for audio request");
      return;
    }

    console.log("Requesting audio response via WebSocket");
    // Clear any existing WAV chunks
    audioChunksRef.current = [];
  setAudioChunksCount(0);

    // Send audio request signal
    websocket.send(JSON.stringify({ type: 'request_audio' }));
  }, [websocket]);

  // Set up the audio response ref for parent component
  useEffect(() => {
    if (audioResponseRef) {
      audioResponseRef.current = {
        requestAudio: requestAudioResponse,
      };
    }
  }, [requestAudioResponse, audioResponseRef]);

  // WebSocket Linear16 PCM Streaming Functions
  const convertToLinear16PCM = (float32Array: Float32Array): ArrayBuffer => {
    const arrayBuffer = new ArrayBuffer(float32Array.length * 2);
    const int16Array = new Int16Array(arrayBuffer);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Convert float (-1 to 1) to int16 (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    return arrayBuffer;
  };

  const handleStartWebSocketStreaming = async () => {
    try {
        const backendUrl: string = import.meta.env.PUBLIC_BACKEND_API_URL || 'http://localhost:3000';
        const isHttps = backendUrl.split(':')[0] === 'https';
        const backendHost = backendUrl.replace(/^https?:\/\//, '');



      // Establish WebSocket connection to voice-stream endpoint
      const ws = new WebSocket(`${isHttps ? 'wss' : 'ws'}://${backendHost}/chat/voice-stream`);
      ws.onopen = () => {
        setStreamingStatus('Connected - Ready to stream');
      };
      
      ws.onmessage = async (event) => {
        try {
          // Handle binary audio data: ArrayBuffer or Blob (raw PCM from backend)
          const data = event.data;

          if (data instanceof ArrayBuffer || data instanceof Blob) {
            // Normalize to ArrayBuffer
            let arrayBuffer: ArrayBuffer;

            if (data instanceof ArrayBuffer) {
              arrayBuffer = data;
              console.log('arrayBuffer  pehla data: ', arrayBuffer);
            } else {
              console.log('Raw PCM Blob received:', data.size, 'bytes');
              arrayBuffer = await data.arrayBuffer();
            }

            try {
              // Store raw PCM ArrayBuffer chunk so we can concatenate all
              // received PCM data into one WAV for playback.
              audioChunksRef.current.push(arrayBuffer);
              // update reactive count so UI can show a Play button for debugging
              setAudioChunksCount((c) => c + 1);

              // Reset the end-of-stream timer and schedule playback after inactivity
              if (audioPlayTimeoutRef.current) {
                window.clearTimeout(audioPlayTimeoutRef.current);
              }
              // Slightly larger timeout to avoid premature playback while backend is still sending
              audioPlayTimeoutRef.current = window.setTimeout(() => {
                try {
                  playAudioResponse();
                } catch (e) {
                  console.error('Error while auto-playing audio response:', e);
                }
              }, 800);

              console.log('Stored PCM chunk:', arrayBuffer.byteLength, 'bytes');
            } catch (convErr) {
              console.error(' Failed to convert PCM to WAV:', convErr);
            }

            return;
          }

          console.log('WebSocket message received (text):', event.data);

          // Check if the message is JSON-formatted
          const isJSON = (str: any) => {
            try {
              JSON.parse(str);
              return true;
            } catch {
              return false;
            }
          };

          if (isJSON(event.data)) {
            const transcriptionResult = JSON.parse(event.data);
            console.log('Parsed transcriptionResult:', transcriptionResult);

            const transcript = transcriptionResult.transcript;

            if (transcript && transcript.length > 0) {
              abortAudioResponse(); // Stop ongoing TTS voice immediately
              console.log('Final transcript received:', transcript);
              ws.send(transcript);
              setTranscript(transcript);
              onPromptSubmit({ text: transcript });
            }
          } else {
            // Handle plain text messages - user is speaking!
            abortAudioResponse(); // Stop ongoing TTS voice immediately
            setTranscript(event.data);
            onPromptSubmit({ text: event.data });
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        setStreamingStatus('WebSocket error');
      };
      
      ws.onclose = (event) => {
        setStreamingStatus('');
        setWebsocket(null);

        // clear any pending playback timeout
        if (audioPlayTimeoutRef.current) {
          window.clearTimeout(audioPlayTimeoutRef.current);
          audioPlayTimeoutRef.current = null;
        }
        // reset chunk count
        setAudioChunksCount(0);
      };
      
      setWebsocket(ws);
      
      // Set up microphone capture for linear16 PCM
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,        // 16kHz for Deepgram
          channelCount: 1,          // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      

      // Set up Web Audio API for real-time PCM conversion
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // 16kHz for Deepgram
      });
      const analyserNode = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      // Create ScriptProcessorNode for real-time audio processing
      const bufferSize = 1024;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      source.connect(processor);
      processor.connect(audioCtx.destination);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      
      // CRITICAL: Enable streaming flag so audio processing can start
      setIsStreamingActive(true);
      streamingActiveRef.current = true;
      mediaStreamRef.current = stream;
      
      // Buffer for accumulating 80ms chunks
      let audioBuffer: Float32Array[] = [];
      let samplesCollected = 0;
      const samplesFor80ms = Math.floor(16000 * 0.08); // 1280 samples = 80ms at 16kHz
      
      // Process audio in real-time
      processor.onaudioprocess = async (event) => {
        if (!streamingActiveRef.current || !ws || ws.readyState !== WebSocket.OPEN) {
          return;
        }
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
       
        audioBuffer.push(new Float32Array(inputData));
        samplesCollected += inputData.length;
        
        if (samplesCollected >= samplesFor80ms) {          
          const combinedBuffer = new Float32Array(samplesCollected);
          let offset = 0;
          for (const chunk of audioBuffer) {
            combinedBuffer.set(chunk, offset);
            offset += chunk.length;
          }
          
          const pcmData = convertToLinear16PCM(combinedBuffer);
          
          try {
            ws.send(pcmData);
            
            setTotalChunksSent(prev => prev + 1);
          } catch (sendError) {
            setIsStreamingActive(false);
          }
          
          // Reset buffer
          audioBuffer = [];
          samplesCollected = 0;
        }
      };
      
      // Audio level monitoring
      const monitorAudioLevel = () => {
        if (!analyserNode) return;
        
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const level = (average / 255) * 100;
        setAudioLevel(level);
        
        if (isRecording) {
          requestAnimationFrame(monitorAudioLevel);
        }
      };
      
      // Store cleanup function
      (window as any).__webSocketCleanup = () => {
        
        streamingActiveRef.current = false;
        setIsStreamingActive(false);
        
        try {
          processor.disconnect();
          source.disconnect();
        } catch (e) {
        }
        
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close();
        }
        
        stream.getTracks().forEach(track => {
          track.stop();
        });
        
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        
        setShowWaveform(false);
        setIsRecording(false);
        setStreamingStatus('Stream ended');
        setAudioLevel(0);
        setCapturedText('');
        setTotalChunksSent(0);
        setWebsocket(null);
        // clear any pending playback timeout
        if (audioPlayTimeoutRef.current) {
          window.clearTimeout(audioPlayTimeoutRef.current);
          audioPlayTimeoutRef.current = null;
        }
        
      };

      setIsRecording(true);
      setShowWaveform(true);
      setStreamingStatus('Streaming linear16 PCM...');
      setTotalChunksSent(0);
      setCapturedText('');
      
      monitorAudioLevel();
      
    } catch (error) {
      setIsRecording(false);
      setStreamingStatus('Error');
      alert('Error starting audio stream. Please check console and try again.');
    }
  };

  const handleStopWebSocketStreaming = () => {
    // IMMEDIATE: Stop audio processing using ref
    streamingActiveRef.current = false;
    setIsStreamingActive(false);
    setIsRecording(false);
    setStreamingStatus('Stopping...');

    // Stop any playing TTS voice
    abortAudioResponse();

    // Close WebSocket immediately
    if (websocket) {
      websocket.close();
      setWebsocket(null);
    }

    // Stop media stream tracks immediately
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Run cleanup function if it exists
    if ((window as any).__webSocketCleanup) {
      (window as any).__webSocketCleanup();
      (window as any).__webSocketCleanup = null;
    }

    // Clear any pending playback timeout
    if (audioPlayTimeoutRef.current) {
      window.clearTimeout(audioPlayTimeoutRef.current);
      audioPlayTimeoutRef.current = null;
    }
    // Reset UI states
    setStreamingStatus('Stopped');
    setTotalChunksSent(0);
    setCapturedText('');
    setAudioLevel(0);
    setShowWaveform(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="floating-assistant-panel"
          className="pointer-events-none fixed inset-0 z-9999"
        >
          <motion.div
            className="pointer-events-auto absolute inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            style={{
              x: isMobile ? 0 : cardX,
              y: isMobile ? 0 : cardY,
              pointerEvents: isReady ? "auto" : "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            dragControls={dragControls}
            dragListener={false}
            {...panelDragProps}
          >
            <motion.div
              className="flex h-full w-full flex-col overflow-hidden bg-background border-none rounded-none shadow-none sm:h-auto sm:w-[400px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <PopupHeader
                className={panelDragProps.drag ? "cursor-move" : ""}
                onClose={onClose}
                title="Square AI"
                subtitle="Powering intelligent customer experiences"
                onPointerDown={handleHeaderPointerDown}
                actions={<AssistantSettingsMenu />}
                icon={<SquareAILogo size={32} />}
              />

              <div className="flex min-h-[320px] flex-1 flex-col md:max-h-[70svh] overflow-hidden gap-4">
                <FloatingAssistantMessageList
                  messages={messages}
                  onQuickSend={onQuickSend}
                  status={status}
                  suggestions={suggestions}
                />

                <div onPointerDown={(event) => event.stopPropagation()}>
                  <Suggestions className="py-3 [&>div]:w-full [&>div]:gap-3">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        type="button"
                        key={`${suggestion}-${index}`}
                        className="group relative flex min-w-[220px] max-w-[320px] items-center gap-3 overflow-hidden rounded-full cursor-help border border-white/12 bg-background/70 px-4 py-3 text-left text-sm text-foreground/75 shadow-[0_14px_30px_-24px_rgba(107,176,42,0.55)] transition-all duration-200 backdrop-blur-sm hover:-translate-y-1 hover:border-primary/45 hover:text-foreground"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => onQuickSend(suggestion)}
                      >
                        <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-primary/8 to-[#9dd958]/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <span className="relative z-10 flex-1 text-sm font-medium leading-snug text-left text-foreground whitespace-normal">
                          {suggestion}
                        </span>
                        <ArrowUpRight className="relative z-10 size-3.5 text-foreground/55 transition-colors duration-200 group-hover:text-foreground/85" />
                      </motion.button>
                    ))}
                  </Suggestions>
                  <form onSubmit={handleSubmit} className="p-3 relative">
                    <motion.div
                      className="group/input relative flex w-full items-center"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: "easeOut",
                        delay: 0.05,
                      }}
                    >
                      <motion.div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-40"
                        animate={{
                          opacity: [0.35, 0.55, 0.35],
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(107,176,42,0.55), rgba(134,201,64,0.45), rgba(157,217,88,0.45))",
                          filter: "blur(18px)",
                        }}
                      />
                      <div className="relative z-10 flex w-full items-center gap-3 rounded-full border border-white/10 bg-background/95 px-4 py-2 backdrop-blur-lg transition-all duration-300 group-focus-within/input:border-primary/60 group-focus-within/input:bg-background/90">
                        <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-r from-white/5 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover/input:opacity-60 group-focus-within/input:opacity-100" />
                        <PromptInputInput
                          placeholder="Ask me anything..."
                          className="h-12 border-none bg-transparent px-0 text-sm text-foreground placeholder:text-foreground/60 focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-none"
                        />
                        
                        {/* ActionBox buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowVoiceDialog(true)}
                            className="h-8 w-8 p-0 hover:bg-white/10"
                          >
                            <Headphones className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                        
                        <motion.div
                          className="relative z-10 shrink-0"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <button
                            type="submit"
                            disabled={status === "submitted"}
                            className="relative h-11 w-11 overflow-hidden rounded-full bg-linear-to-r from-primary via-[#86c940] to-[#9dd958] text-white shadow-[0_20px_40px_-18px_rgba(107,176,42,0.85)] transition-all duration-300 hover:bg-transparent hover:shadow-[0_24px_50px_-18px_rgba(107,176,42,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:shadow-[0_16px_32px_-18px_rgba(107,176,42,0.7)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 2L11 13" />
                              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Voice Dialog overlapping input - Higher z-index */}
                    {showVoiceDialog && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 z-50 m-3 p-4 rounded-lg bg-background/98 backdrop-blur-md border border-secondary/30 shadow-2xl"
                      >
                        <div className="flex flex-col items-center gap-4 h-full justify-center">
                          <h3 className="text-sm font-medium text-center">
                            {isRecording ? 'Listening...' : 'Would you like to talk in realtime with an AI agent?'}
                          </h3>
                          
                          {/* Real-time transcript display */}
                          {isRecording && transcript && (
                            <div className="w-full p-2 rounded-md bg-secondary/20 border border-secondary/30 max-h-16 overflow-y-auto">
                              <p className="text-xs text-center text-foreground/80">
                                "{transcript}"
                              </p>
                            </div>
                          )}
                          
                          {!isRecording ? (
                            <div className="flex flex-col items-center justify-center w-full">
                              <button
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-secondary/30 shadow-lg hover:bg-secondary/10 transition-all"
                                onClick={isRecording ? handleStopWebSocketStreaming : handleStartWebSocketStreaming}
                                aria-label={isRecording ? "Stop streaming" : "Start WebSocket streaming"}
                              >
                                <Mic className={`h-6 w-6 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
                              </button>
                              
                              {/* Streaming status */}
                              {streamingStatus && (
                                <div className="mt-2 text-xs text-center text-foreground/60 max-w-[200px] break-words">
                                  {streamingStatus}
                                </div>
                              )}
                              
                              {/* Show captured text */}
                              {capturedText && (
                                <div className="mt-2 p-2 bg-secondary/10 rounded text-xs text-center max-w-[200px] break-words">
                                  📝 "{capturedText}"
                                </div>
                              )}
                              
                              {/* Show audio level indicator */}
                              {isRecording && (
                                <div className="mt-2 w-full max-w-[100px]">
                                  <div className="h-1 bg-secondary/20 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all duration-100"
                                      style={{ width: `${Math.min(audioLevel, 100)}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-center text-foreground/60 mt-1">
                                    Level: {audioLevel.toFixed(0)}%
                                  </div>
                                </div>
                              )}
                              
                              {/* Close button */}
                              {showVoiceDialog && !isRecording && (
                                <button
                                  onClick={() => setShowVoiceDialog(false)}
                                  className="mt-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all"
                                  aria-label="Close voice dialog"
                                >
                                  <X className="h-3 w-3 text-red-500" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full">
                              {!showWaveform ? (
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-secondary/30 shadow-lg">
                                  <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
                                </div>
                              ) : (
                                <div className="w-20 h-12 flex items-center justify-center">
                                  <div className="flex gap-1 items-end h-full">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <div
                                        key={i}
                                        className="bg-primary rounded w-1.5 animate-pulse"
                                        style={{
                                          height: `${8 + Math.random() * 20}px`,
                                          animationDelay: `${i * 0.1}s`,
                                          animationDuration: '0.8s'
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Close button in next row below recording indicator */}
                              {showVoiceDialog && !isRecording && (
                                <button
                                  onClick={() => setShowVoiceDialog(false)}
                                  className="mt-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all"
                                  aria-label="Close voice dialog"
                                >
                                  <X className="h-3 w-3 text-red-500" />
                                </button>
                              )}
                              
                              <button
                                className="mt-2 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-secondary/30 shadow hover:bg-secondary/10 transition-all"
                                onClick={handleStopWebSocketStreaming}
                                aria-label="Stop WebSocket streaming"
                              >
                                <StopCircle className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </form>
                  
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-linear-to-r from-primary/15 via-[#86c940]/15 to-[#9dd958]/15 px-3 py-1 text-xs text-foreground/80 backdrop-blur-sm shadow-[0_12px_28px_-24px_rgba(107,176,42,0.55)]">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="font-medium tracking-wide">
                      Powered by Square AI
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
