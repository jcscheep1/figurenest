export type Ft09SheetJsModule = typeof import('xlsx');

let sheetJsModulePromise: Promise<Ft09SheetJsModule> | undefined;

/**
 * FT-09's only production-facing SheetJS import boundary.
 *
 * Keep the heavyweight workbook engine out of the initial application graph:
 * callers must invoke this loader from the future file-tool route rather than
 * importing `xlsx` statically. The cached promise contains library code only;
 * workbook bytes, filenames and parsed document data must never be retained
 * here.
 */
export function loadFt09SheetJs(): Promise<Ft09SheetJsModule> {
  sheetJsModulePromise ??= import('xlsx');
  return sheetJsModulePromise;
}
