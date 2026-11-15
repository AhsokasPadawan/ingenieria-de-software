import { useEffect, useRef, useState } from 'react';
import {
  loadExerciseWhiteboard,
  saveExerciseWhiteboard,
  WhiteboardElement,
  WhiteboardPoint,
  WhiteboardTool,
} from '../../domain/studyPreferencesStorage';
import {
  createWhiteboardElement,
  getTextFontSize,
  renderWhiteboardScene,
  updateWhiteboardElement,
} from './whiteboardCanvasRenderer';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { triggerDataUrlDownload } from './workspaceDownloadHelpers';

interface ActiveTextInput {
  x: number;
  y: number;
  value: string;
  color: string;
  strokeWidth: number;
}

export interface ExerciseWhiteboardProps {
  exerciseId: string;
  exerciseTitle: string;
  downloadFileBaseName?: string;
}

export function ExerciseWhiteboard({
  exerciseId,
  exerciseTitle,
  downloadFileBaseName,
}: ExerciseWhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [elements, setElements] = useState<WhiteboardElement[]>(() =>
    loadExerciseWhiteboard(exerciseId),
  );
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);
  const [selectedTool, setSelectedTool] = useState<WhiteboardTool>('pencil');
  const [selectedColor, setSelectedColor] = useState<string>('#34d399');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(4);
  const [activeDrawingElement, setActiveDrawingElement] =
    useState<WhiteboardElement | null>(null);
  const [activeTextInput, setActiveTextInput] =
    useState<ActiveTextInput | null>(null);
  const isDrawingRef = useRef(false);
  const isCancellingTextRef = useRef(false);
  const wasTextOpenOnPointerDownRef = useRef(false);

  const redrawCanvas = (overrideActiveElement?: WhiteboardElement | null) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const targetWidth = Math.floor(rect.width);
    const targetHeight = Math.floor(rect.height);
    if (targetWidth === 0 || targetHeight === 0) return;

    if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
      canvas.width = targetWidth * dpr;
      canvas.height = targetHeight * dpr;
      canvas.style.width = `${targetWidth}px`;
      canvas.style.height = `${targetHeight}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderWhiteboardScene(
      ctx,
      targetWidth,
      targetHeight,
      elements,
      overrideActiveElement !== undefined ? overrideActiveElement : activeDrawingElement,
    );
  };

  useEffect(() => {
    redrawCanvas();
    const handleResize = () => redrawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [elements, activeDrawingElement]);

  const getCanvasPointerPosition = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ): WhiteboardPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
    };
  };

  const commitActiveTextInput = (draftToCommit: ActiveTextInput | null = activeTextInput) => {
    if (isCancellingTextRef.current) {
      isCancellingTextRef.current = false;
      return;
    }
    if (!draftToCommit) return;
    setActiveTextInput(null);
    if (draftToCommit.value.trim().length === 0) return;

    const textElement: WhiteboardElement = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tool: 'text',
      color: draftToCommit.color,
      strokeWidth: draftToCommit.strokeWidth,
      startX: draftToCommit.x,
      startY: draftToCommit.y,
      text: draftToCommit.value,
    };
    const nextElements = [...elements, textElement];
    setElements(nextElements);
    setRedoStack([]);
    saveExerciseWhiteboard(exerciseId, nextElements);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    if (activeTextInput) {
      wasTextOpenOnPointerDownRef.current = true;
      commitActiveTextInput(activeTextInput);
      return;
    }
    wasTextOpenOnPointerDownRef.current = false;
    if (selectedTool === 'text') return;

    isDrawingRef.current = true;
    const newElement = createWhiteboardElement(
      `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      selectedTool,
      selectedColor,
      selectedStrokeWidth,
      getCanvasPointerPosition(event),
    );
    setActiveDrawingElement(newElement);
    redrawCanvas(newElement);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (wasTextOpenOnPointerDownRef.current) {
      wasTextOpenOnPointerDownRef.current = false;
      return;
    }
    if (selectedTool !== 'text') return;
    const pointerPosition = getCanvasPointerPosition(event);
    const rect = containerRef.current?.getBoundingClientRect();
    const maxX = rect ? Math.max(8, Math.floor(rect.width) - 160) : pointerPosition.x;
    const maxY = rect ? Math.max(8, Math.floor(rect.height) - 40) : pointerPosition.y;
    isCancellingTextRef.current = false;
    setActiveTextInput({
      x: Math.max(8, Math.min(pointerPosition.x, maxX)),
      y: Math.max(8, Math.min(pointerPosition.y, maxY)),
      value: '',
      color: selectedColor,
      strokeWidth: selectedStrokeWidth,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeDrawingElement) return;
    const updatedElement = updateWhiteboardElement(
      activeDrawingElement,
      getCanvasPointerPosition(event),
    );
    setActiveDrawingElement(updatedElement);
    redrawCanvas(updatedElement);
  };

  const finalizeDrawing = () => {
    if (!isDrawingRef.current || !activeDrawingElement) return;
    isDrawingRef.current = false;
    const nextElements = [...elements, activeDrawingElement];
    setElements(nextElements);
    setActiveDrawingElement(null);
    setRedoStack([]);
    saveExerciseWhiteboard(exerciseId, nextElements);
    redrawCanvas(null);
  };

  const handleUndo = () => {
    if (elements.length === 0) return;
    const nextElements = elements.slice(0, -1);
    setRedoStack([[elements[elements.length - 1]], ...redoStack]);
    setElements(nextElements);
    saveExerciseWhiteboard(exerciseId, nextElements);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [redoBatch, ...remainingRedo] = redoStack;
    const nextElements = [...elements, ...redoBatch];
    setRedoStack(remainingRedo);
    setElements(nextElements);
    saveExerciseWhiteboard(exerciseId, nextElements);
  };

  const handleClear = () => {
    if (elements.length === 0) return;
    setRedoStack([elements, ...redoStack]);
    setElements([]);
    saveExerciseWhiteboard(exerciseId, []);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fileBaseName = downloadFileBaseName ?? `pizarron-${exerciseId}`;
    triggerDataUrlDownload(canvas.toDataURL('image/png'), `${fileBaseName}.png`);
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <WhiteboardToolbar
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        selectedStrokeWidth={selectedStrokeWidth}
        canUndo={elements.length > 0}
        canRedo={redoStack.length > 0}
        canClear={elements.length > 0}
        onSelectTool={setSelectedTool}
        onSelectColor={setSelectedColor}
        onSelectStrokeWidth={setSelectedStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onDownload={handleDownload}
      />

      <div
        ref={containerRef}
        className={`relative flex-1 min-h-0 w-full overflow-hidden select-none bg-zinc-950 ${
          selectedTool === 'text' ? 'cursor-text' : 'cursor-crosshair'
        }`}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Pizarrón para bocetar ${exerciseTitle}`}
          onPointerDown={handlePointerDown}
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerUp={finalizeDrawing}
          onPointerLeave={finalizeDrawing}
          className="touch-none absolute inset-0 block h-full w-full"
        />
        {activeTextInput && (
          <textarea
            autoFocus
            aria-label="Texto del pizarrón"
            placeholder="Escribe aquí..."
            value={activeTextInput.value}
            onChange={(event) =>
              setActiveTextInput((current) =>
                current ? { ...current, value: event.target.value } : null,
              )
            }
            onBlur={() => commitActiveTextInput(activeTextInput)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                commitActiveTextInput(activeTextInput);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                isCancellingTextRef.current = true;
                setActiveTextInput(null);
              }
            }}
            style={{
              left: activeTextInput.x,
              top: activeTextInput.y,
              color: activeTextInput.color,
              fontSize: `${getTextFontSize(activeTextInput.strokeWidth)}px`,
              lineHeight: 1.25,
            }}
            rows={2}
            className="absolute z-10 min-w-[150px] resize rounded border border-fuchsia-500/80 bg-zinc-900/90 px-1.5 py-0.5 font-medium outline-none placeholder:text-zinc-500"
          />
        )}
      </div>
    </div>
  );
}
