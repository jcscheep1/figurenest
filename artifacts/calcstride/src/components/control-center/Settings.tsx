import { useState } from 'react';
import { useListProjects, useListProjectAuditEvents } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, History, Blocks } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Settings() {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const { data: auditEvents, isLoading: auditLoading } = useListProjectAuditEvents(activeProjectId!, {
    query: {
      enabled: !!activeProjectId,
      queryKey: ['audit-events', activeProjectId]
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Project Settings</h2>
          <p className="text-sm text-muted-foreground">Configuration and audit logs.</p>
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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Core settings are managed via code configuration in this environment.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Audit Log
              </CardTitle>
              <CardDescription>Recent system and administrative actions.</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !auditEvents || auditEvents.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded bg-muted/10">
                  <p className="text-sm text-muted-foreground">No audit events recorded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditEvents.map(event => (
                    <div key={event.id} className="flex gap-4 p-3 rounded border bg-card">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{event.action}</span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase tracking-wider">{event.entityType}</span>
                          {event.entityId && <span>• <span className="font-mono">{event.entityId}</span></span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
