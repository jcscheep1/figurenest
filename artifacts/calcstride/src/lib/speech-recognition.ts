export class SpeechRecognitionAdapter {
  private recognition: any = null;
  private isListening = false;
  
  constructor(
    private onResult: (text: string) => void,
    private onError: (error: string) => void,
    private onEnd: () => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.onResult(transcript);
      };
      
      this.recognition.onerror = (event: any) => {
        this.onError(`Speech recognition error: ${event.error}`);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.onEnd();
      };
    }
  }

  isSupported() {
    return this.recognition !== null;
  }

  start() {
    if (!this.recognition) {
      this.onError('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (this.isListening) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      this.onError(`Could not start listening: ${err.message}`);
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
  }
}
