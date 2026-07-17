'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  ImagePlus,
  Camera,
  Image as ImageIcon,
  ScanLine,
  Copy,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  FileText,
  FileType,
  FileDown,
  Languages,
  Loader2,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGuestUsage } from '@/hooks/useGuestUsage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { validateImageFile } from '@/lib/utils/validators';
import { fileToBase64, formatBytes } from '@/lib/utils/format';
import { downloadTxt, downloadDocx, downloadPdf } from '@/lib/utils/download';
import { QUALITY_OPTIONS, LANGUAGE_HINT_OPTIONS, ROUTES } from '@/lib/constants';
import type { UploadStatus } from '@/types';
import Link from 'next/link';

function countStats(text: string) {
  const trimmed = text.trim();
  const characters = text.length;
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
  return { characters, words, lines, paragraphs };
}

export function UploadDemo() {
  const { user } = useAuth();
  const { limitReached, increment } = useGuestUsage();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [quality, setQuality] = useState<string>('balanced');
  const [languageHint, setLanguageHint] = useState<string>('auto');

  const [processTimeMs, setProcessTimeMs] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [translating, setTranslating] = useState(false);

  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [resolution, setResolution] = useState<{ width: number; height: number } | null>(null);
  const [imageFullscreen, setImageFullscreen] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCursor, setMatchCursor] = useState(0);

  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const extractedText = history[historyIndex];
  const stats = useMemo(() => countStats(extractedText), [extractedText]);
  const hasStarted = status !== 'idle';

  const pushHistory = useCallback(
    (next: string) => {
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, next];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  function handleTextChange(value: string) {
    pushHistory(value);
  }

  function handleUndo() {
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }

  function handleRedo() {
    setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
  }

  function resetAll() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setError(null);
    setHistory(['']);
    setHistoryIndex(0);
    setProcessTimeMs(null);
    setConfidence(null);
    setSearchOpen(false);
    setSearchQuery('');
    setRotation(0);
    setZoom(1);
    setResolution(null);
    setImageFullscreen(false);
  }

  const onSelectFile = useCallback(
    (selected: File) => {
      const validation = validateImageFile(selected);
      if (!validation.valid) {
        const message = validation.error ?? 'Invalid file.';
        setError(message);
        toast({ type: 'error', message });
        return;
      }
      setError(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setStatus('idle');
      setHistory(['']);
      setHistoryIndex(0);
      setProcessTimeMs(null);
      setConfidence(null);
      setRotation(0);
      setZoom(1);
      setResolution(null);
    },
    [previewUrl]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onSelectFile(acceptedFiles[0]);
    },
    [onSelectFile]
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  // Make sure the camera is always released, even if the component unmounts
  // while it's open (e.g. navigating away mid-capture).
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function openCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // The <video> element only mounts once cameraOpen is true, so wait a
      // tick before attaching the stream to it.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera access was denied. Allow camera permission in your browser and try again.'
          : 'Could not access a camera on this device.';
      setCameraError(message);
      toast({ type: 'error', message });
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onSelectFile(file);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],
      'image/heif': [],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  async function handleExtract() {
    if (!file) return;

    if (!user && limitReached) {
      setShowLimitModal(true);
      return;
    }

    setError(null);
    setStatus('processing');
    const startedAt = performance.now();

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const qualityConfig = QUALITY_OPTIONS.find((q) => q.value === quality);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          userId: user?.uid,
          languageHint,
          temperature: qualityConfig?.temperature,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? 'OCR request failed.');
      }

      const { result } = await response.json();
      pushHistory(result.text);
      setConfidence(result.confidence ?? null);
      setProcessTimeMs(performance.now() - startedAt);
      setStatus('done');
      toast({ type: 'success', message: 'Text converted successfully!' });

      if (!user) increment();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'We could not read that image. Please try another one.';
      setError(message);
      setStatus('error');
      toast({ type: 'error', message });
    }
  }

  async function handleTranslate() {
    if (!extractedText.trim()) return;
    setTranslating(true);
    setError(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? 'Translation failed.');
      }
      const { translatedText } = await response.json();
      pushHistory(translatedText);
      toast({ type: 'success', message: 'Translated to English!' });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Could not translate this text.';
      setError(message);
      toast({ type: 'error', message });
    } finally {
      setTranslating(false);
    }
  }

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [] as number[];
    const positions: number[] = [];
    const lower = extractedText.toLowerCase();
    const q = searchQuery.toLowerCase();
    let idx = lower.indexOf(q);
    while (idx !== -1) {
      positions.push(idx);
      idx = lower.indexOf(q, idx + 1);
    }
    return positions;
  }, [searchQuery, extractedText]);

  function jumpToMatch(direction: 1 | -1) {
    if (matches.length === 0) return;
    const next = (matchCursor + direction + matches.length) % matches.length;
    setMatchCursor(next);
    const pos = matches[next];
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(pos, pos + searchQuery.length);
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: upload panel */}
        <Card className="flex flex-col p-6">
          <div className="mb-4 flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={resetAll}>
              <ImagePlus className="h-4 w-4" /> New Image
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={openCamera}>
              <Camera className="h-4 w-4" /> Use Camera
            </Button>
          </div>
          {cameraError && <p className="mb-3 text-sm text-red-600">{cameraError}</p>}

          <div
            {...getRootProps()}
            className={`focus-ring relative flex flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragActive
                ? 'border-signal bg-signal/5'
                : 'border-ink-200 hover:border-ink-400 dark:border-ink-600'
            }`}
          >
            <input {...getInputProps()} />

            {previewUrl ? (
              <div className="w-full" onClick={(e) => e.stopPropagation()}>
                <div className="mb-2 flex flex-wrap items-center justify-center gap-1 rounded-lg bg-ink-50 p-1 dark:bg-ink-900/60">
                  <button
                    title="Replace image"
                    onClick={open}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button
                    title="Rotate left"
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    title="Rotate right"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    title="Zoom out"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    title="Zoom in"
                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    title="Reset view"
                    onClick={() => {
                      setRotation(0);
                      setZoom(1);
                    }}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <Crop className="h-4 w-4" />
                  </button>
                  <button
                    title="Fullscreen"
                    onClick={() => setImageFullscreen(true)}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-800 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    title="Remove image"
                    onClick={resetAll}
                    className="focus-ring rounded-md p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-lg bg-ink-50 dark:bg-ink-900/60">
                  <img
                    src={previewUrl}
                    alt="Selected handwriting"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      setResolution({ width: img.naturalWidth, height: img.naturalHeight });
                    }}
                    style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                  />
                  {status === 'processing' && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-ink-900/10">
                      <div className="absolute inset-x-0 h-1/3 animate-scan-line bg-gradient-to-b from-transparent via-signal/60 to-transparent" />
                    </div>
                  )}
                </div>

                {status === 'processing' && (
                  <p className="mt-2 flex items-center justify-center gap-2 text-sm text-signal">
                    <ScanLine className="h-4 w-4 animate-pulse" /> Analyzing handwriting…
                  </p>
                )}

                <div className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-ink-100 text-left dark:bg-ink-700">
                  <div className="bg-white px-3 py-2 dark:bg-ink-800">
                    <p className="text-[10px] uppercase tracking-wide text-ink-400">File</p>
                    <p className="truncate text-xs font-medium text-ink-700 dark:text-vellum-100">{file?.name}</p>
                  </div>
                  <div className="bg-white px-3 py-2 dark:bg-ink-800">
                    <p className="text-[10px] uppercase tracking-wide text-ink-400">Size</p>
                    <p className="text-xs font-medium text-ink-700 dark:text-vellum-100">
                      {file ? formatBytes(file.size) : '—'}
                    </p>
                  </div>
                  <div className="bg-white px-3 py-2 dark:bg-ink-800">
                    <p className="text-[10px] uppercase tracking-wide text-ink-400">Resolution</p>
                    <p className="text-xs font-medium text-ink-700 dark:text-vellum-100">
                      {resolution ? `${resolution.width} × ${resolution.height}` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700">
                  <UploadCloud className="h-6 w-6 text-ink-400" strokeWidth={1.5} />
                </div>
                <p className="mt-4 font-medium text-ink-700 dark:text-vellum-100">
                  {isDragActive ? 'Drop your image here' : 'Drag & drop your handwritten image here'}
                </p>
                <p className="mt-1 text-sm text-ink-400">
                  or{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                    className="text-signal underline"
                  >
                    click to browse
                  </button>
                </p>
                <p className="mt-3 font-mono text-xs text-ink-400">
                  JPG · PNG · WEBP · HEIC — up to 20MB
                </p>
              </>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <Button
            className="mt-4 w-full"
            disabled={!file || status === 'processing'}
            onClick={handleExtract}
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Extracting…
              </>
            ) : (
              'Extract text'
            )}
          </Button>

          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={languageHint}
              onChange={(e) => setLanguageHint(e.target.value)}
              className="focus-ring rounded-full border border-ink-200 bg-transparent px-3 py-1 text-xs font-medium text-ink-600 dark:border-ink-600 dark:text-vellum-200"
            >
              {LANGUAGE_HINT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="focus-ring rounded-full border border-ink-200 bg-transparent px-3 py-1 text-xs font-medium text-ink-600 dark:border-ink-600 dark:text-vellum-200"
            >
              {QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Right: result panel */}
        <div
          className={
            (expanded ? 'fixed inset-4 z-50 ' : '') +
            'flex flex-col overflow-hidden rounded-2xl border border-ink-100/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800/60'
          }
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-700">
            <div className="flex items-center gap-1">
              <button
                title="Copy"
                onClick={() => {
                  navigator.clipboard
                    .writeText(extractedText)
                    .then(() => toast({ type: 'success', message: 'Text copied!' }))
                    .catch(() => toast({ type: 'error', message: 'Could not copy text.' }));
                }}
                disabled={!extractedText}
                className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                title={expanded ? 'Collapse' : 'Expand'}
                onClick={() => setExpanded((v) => !v)}
                className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                title="Undo"
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                title="Redo"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
              >
                <Redo2 className="h-4 w-4" />
              </button>
              <button
                title="Search"
                onClick={() => setSearchOpen((v) => !v)}
                disabled={!extractedText}
                className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30 dark:hover:bg-ink-700 dark:hover:text-vellum-100"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              title="Clear text"
              onClick={() => pushHistory('')}
              disabled={!extractedText}
              className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {searchOpen && (
            <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-2 dark:border-ink-700">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMatchCursor(0);
                }}
                placeholder="Find in text…"
                className="focus-ring flex-1 rounded-lg border border-ink-200 px-2 py-1 text-sm dark:border-ink-700 dark:bg-ink-900"
              />
              <span className="whitespace-nowrap text-xs text-ink-400">
                {matches.length > 0 ? `${matchCursor + 1} of ${matches.length}` : '0 of 0'}
              </span>
              <button onClick={() => jumpToMatch(-1)} className="text-ink-400 hover:text-ink-700">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button onClick={() => jumpToMatch(1)} className="text-ink-400 hover:text-ink-700">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button onClick={() => setSearchOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={extractedText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={
              hasStarted
                ? ''
                : 'Your recognized handwriting will appear here — upload an image and hit "Extract text" to begin. You can also type or paste text directly.'
            }
            className={`w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm text-ink-800 outline-none dark:text-vellum-100 ${
              expanded ? 'min-h-0' : 'min-h-[280px]'
            }`}
          />

          <div className="grid grid-cols-3 gap-px border-t border-ink-100 bg-ink-100 text-center dark:border-ink-700 dark:bg-ink-700 sm:grid-cols-6">
            {[
              { label: 'Characters', value: stats.characters },
              { label: 'Words', value: stats.words },
              { label: 'Lines', value: stats.lines },
              { label: 'Paragraphs', value: stats.paragraphs },
              {
                label: 'Process time',
                value: processTimeMs ? `${(processTimeMs / 1000).toFixed(1)}s` : '—',
              },
              {
                label: 'Confidence',
                value: confidence !== null ? `${confidence}%` : '—',
                title: 'Estimated from unreadable segments — Gemini does not return a true confidence score.',
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-2 py-3 dark:bg-ink-800" title={stat.title}>
                <p className="font-display text-lg text-ink-800 dark:text-vellum-50">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-ink-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 p-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={!extractedText.trim() || translating}
              onClick={handleTranslate}
            >
              {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
              English
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!extractedText}
              onClick={() => {
                try {
                  downloadTxt('conversion.txt', extractedText);
                  toast({ type: 'success', message: 'Downloaded as TXT!' });
                } catch {
                  toast({ type: 'error', message: 'Could not download the TXT file.' });
                }
              }}
            >
              <FileText className="h-4 w-4" /> TXT
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!extractedText}
              onClick={() => {
                try {
                  downloadDocx('conversion.docx', extractedText);
                  toast({ type: 'success', message: 'Downloaded as DOCX!' });
                } catch {
                  toast({ type: 'error', message: 'Could not download the DOCX file.' });
                }
              }}
            >
              <FileType className="h-4 w-4" /> DOCX
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!extractedText}
              onClick={() => {
                try {
                  downloadPdf('conversion.pdf', extractedText);
                  toast({ type: 'success', message: 'Downloaded as PDF!' });
                } catch {
                  toast({ type: 'error', message: 'Could not download the PDF file.' });
                }
              }}
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            {status === 'done' && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3.5 w-3.5" /> Extracted
              </span>
            )}
          </div>
        </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-900/95 p-6 animate-fade-up">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-h-[70vh] w-full max-w-2xl rounded-xl object-contain"
          />
          <div className="mt-6 flex gap-4">
            <button
              onClick={stopCamera}
              className="focus-ring rounded-full border border-white/30 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <Button size="lg" onClick={capturePhoto}>
              <Camera className="h-5 w-5" /> Capture
            </Button>
          </div>
        </div>
      )}

      {imageFullscreen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/90 p-6 animate-fade-up">
          <button
            aria-label="Close fullscreen"
            onClick={() => setImageFullscreen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={previewUrl}
            alt="Handwriting, fullscreen"
            style={{ transform: `rotate(${rotation}deg)` }}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      <Modal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="You've used your 2 free conversions"
      >
        <p>Create a free account to continue converting handwritten notes.</p>
        <div className="mt-6 flex gap-3">
          <Link href={ROUTES.register} className="flex-1">
            <Button className="w-full">Register</Button>
          </Link>
          <Link href={ROUTES.login} className="flex-1">
            <Button variant="ghost" className="w-full">Log in</Button>
          </Link>
        </div>
      </Modal>
    </>
  );
}
