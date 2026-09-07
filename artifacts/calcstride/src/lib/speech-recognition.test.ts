import { test, mock } from 'node:test';
import assert from 'node:assert';
import { SpeechRecognitionAdapter } from './speech-recognition';

test('SpeechRecognitionAdapter', async (t) => {
  await t.test('isSupported returns false if no SpeechRecognition available', () => {
    // Save original if any
    const original = (global as any).window;
    (global as any).window = {};
    
    const adapter = new SpeechRecognitionAdapter(() => {}, () => {}, () => {});
    assert.strictEqual(adapter.isSupported(), false);
    
    (global as any).window = original;
  });

  await t.test('start throws error if not supported', () => {
    const original = (global as any).window;
    (global as any).window = {};
    
    let errorCalled = false;
    const adapter = new SpeechRecognitionAdapter(
      () => {}, 
      (err) => { errorCalled = true; assert.ok(err.includes('not supported')); }, 
      () => {}
    );
    
    adapter.start();
    assert.strictEqual(errorCalled, true);
    
    (global as any).window = original;
  });
});
