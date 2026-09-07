import { useState } from 'react';
import { useListProjects, useListProjectIntegrations, useCreateProjectIntegration, getListProjectIntegrationsQueryKey, getListProjectApprovalsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, RefreshCw, BarChart, Settings, Blocks } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_PROVIDERS = [
  { id: 'google_search_console', name: 'Google Search Console', type: 'indexing', icon: SearchIcon },
  { id: 'ga4', name: 'Google Analytics 4', type: 'analytics', icon: BarChart },
  { id: 'google_adsense', name: 'Google AdSense', type: 'revenue', icon: DollarIcon },
  { id: 'openai', name: 'OpenAI', type: 'assistant', icon: BotIcon }
];

function SearchIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> }
function DollarIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
function BotIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg> }

export function Integrations() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const { data: integrations, isLoading: integrationsLoading } = useListProjectIntegrations(activeProjectId!, {
    query: {
      enabled: !!activeProjectId,
      queryKey: getListProjectIntegrationsQueryKey(activeProjectId!)
    }
  });
  
  const createIntegration = useCreateProjectIntegration();

  const handleConnect = (providerId: string) => {
    if (!activeProjectId) return;
    
    createIntegration.mutate({ 
      projectId: activeProjectId,
      data: { provider: providerId } 
    }, {
      onSuccess: () => {
        toast.success(`Connection approval created for ${providerId}`);
        queryClient.invalidateQueries({ queryKey: getListProjectApprovalsQueryKey(activeProjectId) });
      },
      onError: (err) => {
        toast.error('Failed to initiate connection');
      }
    });
  };

  if (!activeProjectId && !projectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
        <Blocks className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Project Selected</h3>
        <p className="text-sm text-muted-foreground">Select or create a project to manage integrations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Data Providers</h2>
          <p className="text-sm text-muted-foreground">Connect external services for indexing, analytics, and revenue.</p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_PROVIDERS.map(provider => {
          const Icon = provider.icon;
          const activeIntegration = integrations?.find(i => i.provider === provider.id);
          const status = activeIntegration?.status || 'not_connected';
          const isPending = status === 'pending' || (createIntegration.isPending && createIntegration.variables?.data.provider === provider.id);
          
          return (
            <Card key={provider.id} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Icon className="h-5 w-5 text-foreground/80" />
                  </div>
                  <Badge variant={
                    status === 'connected' ? 'default' : 
                    status === 'pending' ? 'secondary' : 
                    status === 'error' ? 'destructive' : 
                    'outline'
                  } className="capitalize text-[10px] tracking-wider">
                    {status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-base">{provider.name}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wider font-medium text-muted-foreground mt-1">
                  {provider.type} provider
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                {activeIntegration?.lastCheckedAt ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/30 p-2 rounded-md">
                    <RefreshCw size={12} /> Last synced: {new Date(activeIntegration.lastCheckedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                    No data synchronized yet.
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t">
                {status === 'not_connected' || status === 'error' ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleConnect(provider.id)}
                    disabled={isPending || integrationsLoading}
                  >
                    {isPending ? 'Requesting...' : 'Request connection'}
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    <Settings className="mr-2 h-4 w-4" /> Configure
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
