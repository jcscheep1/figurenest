import { FileToolError } from './file-tools-foundation';
import { cloneEditObjects, type PdfEditObject } from './pdf-sign-edit-core';

export type PdfQuarterTurn = 0 | 90 | 180 | 270;
export type PdfPagePlanItem = {
  sourcePageIndex: number;
  rotation: PdfQuarterTurn;
};

export type PreparedPdfPageOperations = {
  buffer: ArrayBuffer;
  edits: PdfEditObject[];
};

export function normalizeQuarterTurn(value: number): PdfQuarterTurn {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value % 90 !== 0) {
    throw new FileToolError('malformed', 'The page rotation must use 90-degree steps.');
  }
  const normalized = ((value % 360) + 360) % 360;
  if (normalized !== 0 && normalized !== 90 && normalized !== 180 && normalized !== 270) {
    throw new FileToolError('malformed', 'The page rotation must use 90-degree steps.');
  }
  return normalized;
}

export function createPdfPagePlan(pageCount: number): PdfPagePlanItem[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new FileToolError('malformed', 'A PDF must contain at least one page.');
  }
  return Array.from({ length: pageCount }, (_, sourcePageIndex) => ({ sourcePageIndex, rotation: 0 as const }));
}

export function clonePdfPagePlan(plan: readonly PdfPagePlanItem[]): PdfPagePlanItem[] {
  return plan.map((item) => ({ ...item }));
}

export function validatePdfPagePlan(plan: readonly PdfPagePlanItem[], sourcePageCount: number): PdfPagePlanItem[] {
  if (!Number.isInteger(sourcePageCount) || sourcePageCount < 1) {
    throw new FileToolError('malformed', 'The source PDF page count is invalid.');
  }
  if (plan.length < 1) throw new FileToolError('resource-limit', 'A PDF must keep at least one page.');
  if (plan.length > sourcePageCount) throw new FileToolError('malformed', 'The page plan contains more pages than the source PDF.');

  const seen = new Set<number>();
  return plan.map((item) => {
    if (!Number.isInteger(item.sourcePageIndex) || item.sourcePageIndex < 0 || item.sourcePageIndex >= sourcePageCount) {
      throw new FileToolError('malformed', 'The page plan points to a missing source page.');
    }
    if (seen.has(item.sourcePageIndex)) throw new FileToolError('malformed', 'The page plan contains the same source page more than once.');
    seen.add(item.sourcePageIndex);
    return { sourcePageIndex: item.sourcePageIndex, rotation: normalizeQuarterTurn(item.rotation) };
  });
}

function assertVisiblePageIndex(plan: readonly PdfPagePlanItem[], index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= plan.length) {
    throw new FileToolError('malformed', 'The selected page is outside the current page plan.');
  }
}

export function rotatePdfPage(plan: readonly PdfPagePlanItem[], visibleIndex: number, delta: 90 | -90): PdfPagePlanItem[] {
  assertVisiblePageIndex(plan, visibleIndex);
  return plan.map((item, index) => index === visibleIndex
    ? { ...item, rotation: normalizeQuarterTurn(item.rotation + delta) }
    : { ...item });
}

export function movePdfPage(plan: readonly PdfPagePlanItem[], fromIndex: number, toIndex: number): PdfPagePlanItem[] {
  assertVisiblePageIndex(plan, fromIndex);
  assertVisiblePageIndex(plan, toIndex);
  const next = clonePdfPagePlan(plan);
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function deletePdfPage(plan: readonly PdfPagePlanItem[], visibleIndex: number): PdfPagePlanItem[] {
  assertVisiblePageIndex(plan, visibleIndex);
  if (plan.length <= 1) throw new FileToolError('resource-limit', 'A PDF must keep at least one page.');
  return plan.filter((_item, index) => index !== visibleIndex).map((item) => ({ ...item }));
}

export class PdfPagePlanHistory {
  private past: PdfPagePlanItem[][] = [];
  private present: PdfPagePlanItem[];
  private future: PdfPagePlanItem[][] = [];

  constructor(initial: readonly PdfPagePlanItem[] = []) {
    this.present = clonePdfPagePlan(initial);
  }

  get value(): PdfPagePlanItem[] {
    return clonePdfPagePlan(this.present);
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  commit(next: readonly PdfPagePlanItem[]): PdfPagePlanItem[] {
    if (next.length < 1) throw new FileToolError('resource-limit', 'A PDF must keep at least one page.');
    this.past.push(clonePdfPagePlan(this.present));
    this.present = clonePdfPagePlan(next);
    this.future = [];
    return this.value;
  }

  undo(): PdfPagePlanItem[] {
    const previous = this.past.pop();
    if (!previous) return this.value;
    this.future.push(clonePdfPagePlan(this.present));
    this.present = previous;
    return this.value;
  }

  redo(): PdfPagePlanItem[] {
    const next = this.future.pop();
    if (!next) return this.value;
    this.past.push(clonePdfPagePlan(this.present));
    this.present = next;
    return this.value;
  }

  reset(next: readonly PdfPagePlanItem[] = []): PdfPagePlanItem[] {
    this.past = [];
    this.present = clonePdfPagePlan(next);
    this.future = [];
    return this.value;
  }
}

export function remapEditsForPdfPagePlan(
  edits: readonly PdfEditObject[],
  plan: readonly PdfPagePlanItem[],
): PdfEditObject[] {
  const outputIndexBySource = new Map(plan.map((item, outputIndex) => [item.sourcePageIndex, outputIndex]));
  return cloneEditObjects(edits)
    .filter((item) => outputIndexBySource.has(item.pageIndex))
    .map((item) => ({ ...item, pageIndex: outputIndexBySource.get(item.pageIndex)! }));
}

export async function preparePdfPageOperations(
  original: ArrayBuffer,
  edits: readonly PdfEditObject[],
  pagePlan: readonly PdfPagePlanItem[],
): Promise<PreparedPdfPageOperations> {
  const { PDFDocument, degrees } = await import('pdf-lib');
  let source: Awaited<ReturnType<typeof PDFDocument.load>>;
  try {
    source = await PDFDocument.load(original, { ignoreEncryption: false, updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/encrypt|password/i.test(message)) {
      throw new FileToolError('malformed', 'Encrypted or password-protected PDFs are not supported.');
    }
    throw new FileToolError('malformed', 'The PDF could not be opened for local page operations.');
  }

  const plan = validatePdfPagePlan(pagePlan, source.getPageCount());
  const target = await PDFDocument.create();
  const sourceIndexes = plan.map((item) => item.sourcePageIndex);
  const copiedPages = await target.copyPages(source, sourceIndexes);

  copiedPages.forEach((page, index) => {
    const sourcePage = source.getPage(plan[index].sourcePageIndex);
    const combinedRotation = normalizeQuarterTurn(sourcePage.getRotation().angle + plan[index].rotation);
    page.setRotation(degrees(combinedRotation));
    target.addPage(page);
  });

  const bytes = await target.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
  return {
    buffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    edits: remapEditsForPdfPagePlan(edits, plan),
  };
}