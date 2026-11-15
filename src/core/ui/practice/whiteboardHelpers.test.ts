import { describe, expect, it, vi } from 'vitest';
import { WhiteboardElement } from '../../domain/studyPreferencesStorage';
import {
  createWhiteboardElement,
  getTextFontSize,
  renderWhiteboardScene,
  updateWhiteboardElement,
} from './whiteboardCanvasRenderer';
import {
  buildPracticeWorkspaceDownloadBaseName,
  buildSlideWorkspaceDownloadBaseName,
  formatCurrentIsoDate,
  sanitizeDownloadFileName,
  triggerDataUrlDownload,
  triggerTextFileDownload,
} from './workspaceDownloadHelpers';

function createMockCanvasContext() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '',
    textBaseline: 'alphabetic',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    ellipse: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('whiteboardCanvasRenderer', () => {
  it('creates and updates freehand and geometric whiteboard elements', () => {
    const pencil = createWhiteboardElement('p-1', 'pencil', '#34d399', 4, { x: 10, y: 15 });
    const updatedPencil = updateWhiteboardElement(pencil, { x: 25, y: 30 });
    expect(updatedPencil.points).toEqual([
      { x: 10, y: 15 },
      { x: 25, y: 30 },
    ]);

    const triangle = createWhiteboardElement('t-1', 'triangle', '#38bdf8', 2, { x: 20, y: 30 });
    const updatedTriangle = updateWhiteboardElement(triangle, { x: 80, y: 90 });
    expect(updatedTriangle).toMatchObject({
      startX: 20,
      startY: 30,
      endX: 80,
      endY: 90,
    });
  });

  it('renders scene elements including triangle and multiline text', () => {
    const ctx = createMockCanvasContext();
    const elements: WhiteboardElement[] = [
      { id: '1', tool: 'triangle', color: '#34d399', strokeWidth: 4, startX: 10, startY: 20, endX: 50, endY: 60 },
      { id: '2', tool: 'text', color: '#f4f4f5', strokeWidth: 4, startX: 15, startY: 25, text: 'Línea 1\nLínea 2' },
    ];

    renderWhiteboardScene(ctx, 400, 300, elements, null);

    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);
    expect(ctx.moveTo).toHaveBeenCalledWith(30, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(50, 60);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 60);
    expect(ctx.fillText).toHaveBeenNthCalledWith(1, 'Línea 1', 15, 25);
    expect(ctx.fillText).toHaveBeenNthCalledWith(2, 'Línea 2', 15, 25 + getTextFontSize(4) * 1.25);
  });
});

describe('workspaceDownloadHelpers', () => {
  it('sanitizes filenames and builds download base names', () => {
    expect(sanitizeDownloadFileName('Árboles & Grafos #1')).toBe('arboles-grafos-1');
    expect(sanitizeDownloadFileName('---')).toBe('archivo');
    const fixedDate = new Date(2026, 10, 15);
    expect(formatCurrentIsoDate(fixedDate)).toBe('2026-11-15');
    expect(buildPracticeWorkspaceDownloadBaseName('ex-1', 'Patrón Command')).toBe('ex-1-patron-command');
    expect(buildSlideWorkspaceDownloadBaseName('Unidad 1', fixedDate)).toBe('unidad-1-2026-11-15');
  });

  it('triggers anchor downloads for data URLs and text blobs', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectUrlSpy = vi.fn(() => 'blob:mock-url');
    const revokeObjectUrlSpy = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: createObjectUrlSpy, revokeObjectURL: revokeObjectUrlSpy });

    triggerDataUrlDownload('data:image/png;base64,abc', 'pizarron.png');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    triggerTextFileDownload('console.log(1);', 'codigo.js');
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');

    vi.unstubAllGlobals();
    clickSpy.mockRestore();
  });
});
