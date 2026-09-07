import { useState } from 'react';
import { useListProjects, useListProjectApprovals, useConfirmProjectApproval, getListProjectApprovalsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Blocks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function Approvals() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const { data: approvals, isLoading: approvalsLoading } = useListProjectApprovals(activeProjectId!, {
    query: {
      enabled: !!activeProjectId,
      queryKey: getListProjectApprovalsQueryKey(activeProjectId!)
    }
  });

  const confirmApproval = useConfirmProjectApproval();

  const handleApprove = (approvalId: string) => {
    if (!activeProjectId) return;
    
    confirmApproval.mutate({
      projectId: activeProjectId,
      approvalId
    }, {
      onSuccess: () => {
        toast.success('Action approved');
        queryClient.invalidateQueries({ queryKey: getListProjectApprovalsQueryKey(activeProjectId) });
      },
      onError: () => {
        toast.error('Failed to process approval');
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

  const pending = approvals?.filter(a => a.status === 'pending') || [];
  const history = approvals?.filter(a => a.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Action Approvals</h2>
          <p className="text-sm text-muted-foreground">Review and confirm system actions requiring owner consent.</p>
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
              Pending Queue
              <Badge variant="secondary" className="ml-2 font-mono">{pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvalsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center">
                  <Check className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm">No pending approvals.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(approval => (
                  <div key={approval.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
                    <div className="mt-1 shrink-0"><Clock className="text-accent h-5 w-5" /></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{approval.action}</h4>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {formatDistanceToNow(new Date(approval.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border border-dashed">
                        {approval.summary}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-2 justify-end shrink-0 sm:w-28 mt-2 sm:mt-0">
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="flex-1"
                        onClick={() => handleApprove(approval.id)}
                        disabled={confirmApproval.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 5).map(approval => (
                  <div key={approval.id} className="flex flex-col sm:flex-row gap-4 p-3 rounded-lg border bg-muted/20">
                    <div className="mt-1 shrink-0">
                      {approval.status === 'approved' 
                        ? <Check className="text-primary h-4 w-4" /> 
                        : <X className="text-destructive h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-muted-foreground">{approval.action}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(approval.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 line-clamp-1">{approval.summary}</p>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider
                        ${approval.status === 'approved' ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30'}
                      `}>
                        {approval.status}
                      </Badge>
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
