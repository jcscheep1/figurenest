import { useState, useEffect, useRef, useCallback } from 'react';
import { useListProjects, useRunAssistantCommand, AssistantCommandResponse } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, Mic, MicOff, Info, AlertTriangle, CheckCircle2, Blocks } from 'lucide-react';
import { SpeechRecognitionAdapter } from '@/lib/speech-recognition';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: AssistantCommandResponse;
  isError?: boolean;
};

export function Assistant() {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'I am the FigureNest operations assistant. How can I help with your projects today?'
    }
  ]);
  
  const [isListening, setIsListening] = useState(false);
  const speechAdapter = useRef<SpeechRecognitionAdapter | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const runCommand = useRunAssistantCommand();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    speechAdapter.current = new SpeechRecognitionAdapter(
      (text) => setInput(prev => prev + (prev ? ' ' : '') + text),
      (err) => {
        toast.error(err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
    
    return () => {
      speechAdapter.current?.stop();
    };
  }, []);

  const toggleListen = useCallback(() => {
    if (!speechAdapter.current?.isSupported()) {
      toast.error('Voice input is not supported in this browser. Please type your command.');
      return;
    }
    
    if (isListening) {
      speechAdapter.current.stop();
    } else {
      speechAdapter.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !activeProjectId || runCommand.isPending) return;

    const command = input.trim();
    setInput('');
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: command };
    setMessages(prev => [...prev, userMsg]);

    runCommand.mutate({
      projectId: activeProjectId,
      data: { command }
    }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          data
        }]);
      },
      onError: (error) => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your command.',
          isError: true
        }]);
      }
    });
  };

  if (!activeProjectId && !projectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
        <Blocks className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Project Selected</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center shrink-0">
        <div>
          <h2 className="text-xl font-medium tracking-tight">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Issue commands and query metrics.</p>
        </div>
        
        {projectsLoading ? (
          <Skeleton className="h-10 w-[200px]" />
        ) : (
          <Select value={activeProjectId || undefined} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-[250px] font-mono text-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card className="flex-1 flex flex-col min-h-0 border-sidebar-border shadow-sm">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-sidebar-accent text-sidebar-accent-foreground border'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : msg.isError 
                      ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                      : 'bg-muted/50 border rounded-tl-sm text-foreground'
                }`}>
                  {msg.content}
                </div>
                
                {msg.data && msg.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px] tracking-wider uppercase font-mono bg-background">
                      {msg.data.category}
                    </Badge>
                    {msg.data.approval && (
                      <Badge variant="secondary" className="text-[10px] tracking-wider uppercase bg-accent/10 text-accent border-accent/20">
                        Approval Required
                      </Badge>
                    )}
                    {!msg.data.available && msg.data.category !== 'general' && (
                      <Badge variant="outline" className="text-[10px] tracking-wider uppercase border-muted-foreground/30 text-muted-foreground">
                        Data Unavailable
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {runCommand.isPending && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground border">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border flex items-center gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-3 border-t bg-muted/10 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Button 
              type="button" 
              size="icon" 
              variant={isListening ? "default" : "outline"}
              className={isListening ? "animate-pulse bg-accent text-accent-foreground hover:bg-accent/90 shrink-0" : "shrink-0"}
              onClick={toggleListen}
              title={isListening ? "Stop listening" : "Use voice command"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Input 
              placeholder="Ask for metrics or issue a command..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-background"
              disabled={runCommand.isPending}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || runCommand.isPending}
              className="shrink-0"
            >
              <Send size={18} className="mr-2 hidden sm:block" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
