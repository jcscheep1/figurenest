import { useState } from 'react';
import { useListProjects, useListProjectAlerts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Blocks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function Alerts() {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const { data: alerts, isLoading: alertsLoading } = useListProjectAlerts(activeProjectId!, {
    query: {
      enabled: !!activeProjectId,
      queryKey: ['alerts', activeProjectId]
    }
  });

  if (!activeProjectId && !projectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
        <Blocks className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Project Selected</h3>
      </div>
    );
  }

  const unresolved = alerts?.filter(a => !a.resolved) || [];
  const resolved = alerts?.filter(a => a.resolved) || [];

  const getIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertCircle className="text-destructive h-5 w-5" />;
      case 'warning': return <AlertTriangle className="text-accent h-5 w-5" />;
      case 'info': return <Info className="text-primary h-5 w-5" />;
      default: return <Info className="text-muted-foreground h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-xl font-medium tracking-tight">System Alerts</h2>
          <p className="text-sm text-muted-foreground">Monitor technical issues and performance warnings.</p>
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Active Alerts 
              <Badge variant="secondary" className="ml-2 font-mono">{unresolved.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : unresolved.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2 opacity-50" />
                  <p className="text-sm">No active alerts for this project.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {unresolved.map(alert => (
                  <div key={alert.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
                    <div className="mt-1">{getIcon(alert.severity)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="pt-2">
                        <Badge variant="outline" className={`text-[10px] tracking-wider uppercase
                          ${alert.severity === 'critical' ? 'border-destructive text-destructive' : 
                            alert.severity === 'warning' ? 'border-accent text-accent' : ''}
                        `}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {resolved.length > 0 && (
          <Card className="opacity-80">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Recent History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolved.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex gap-4 p-3 rounded-lg border bg-muted/20">
                    <div className="mt-1 opacity-50"><CheckCircle2 className="h-4 w-4" /></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm line-through text-muted-foreground">{alert.title}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
