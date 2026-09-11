import * as mammoth from 'mammoth';

type ConvertRequest = {
  id: number;
  arrayBuffer: ArrayBuffer;
};

type ConvertResponse =
  | { id: number; ok: true; html: string; messages: string[] }
  | { id: number; ok: false; error: string };

type DocxWorkerScope = {
  onmessage: ((event: MessageEvent<ConvertRequest>) => void | Promise<void>) | null;
  postMessage: (message: ConvertResponse) => void;
};

const workerScope = self as unknown as DocxWorkerScope;

workerScope.onmessage = async (event) => {
  const { id, arrayBuffer } = event.data;
  try {
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      { externalFileAccess: false },
    );
    const response: ConvertResponse = {
      id,
      ok: true,
      html: result.value,
      messages: result.messages.map((message) => message.message),
    };
    workerScope.postMessage(response);
  } catch (error) {
    const response: ConvertResponse = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : 'DOCX conversion failed.',
    };
    workerScope.postMessage(response);
  }
};
