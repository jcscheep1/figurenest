import { useState } from 'react';
import { useGetDashboardSummary, useListProjects } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowUpRight, Blocks, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

export function Overview() {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project
  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary(activeProjectId!, {
    query: {
      enabled: !!activeProjectId,
      queryKey: ['dashboard', activeProjectId]
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-xl font-medium tracking-tight">System Status</h2>
          <p className="text-sm text-muted-foreground">Monitor your properties and pending actions.</p>
        </div>
        
        {projectsLoading ? (
          <Skeleton className="h-10 w-[200px]" />
        ) : projects?.length ? (
          <Select 
            value={activeProjectId || undefined} 
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="w-full sm:w-[250px] font-mono text-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground border px-3 py-2 rounded-md bg-muted/50">
            No projects found
          </div>
        )}
      </div>

      {!activeProjectId && !projectsLoading && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Blocks className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Projects</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first project in the Projects tab to see the overview.
            </p>
            <Link href="/control-center/projects" className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
              Go to Projects
            </Link>
          </CardContent>
        </Card>
      )}

      {activeProjectId && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Active Alerts" 
            value={summaryLoading ? null : (summary?.activeAlerts ?? 0)}
            icon={AlertCircle}
            trend={summary?.activeAlerts ? 'Requires attention' : 'All clear'}
            trendType={summary?.activeAlerts ? 'destructive' : 'good'}
            linkTo="/control-center/alerts"
          />
          <MetricCard 
            title="Pending Approvals" 
            value={summaryLoading ? null : (summary?.pendingApprovals ?? 0)}
            icon={Blocks}
            trend={summary?.pendingApprovals ? 'Action required' : 'Up to date'}
            trendType={summary?.pendingApprovals ? 'warning' : 'good'}
            linkTo="/control-center/approvals"
          />
          <MetricCard 
            title="Indexed Pages" 
            value={summaryLoading ? null : (summary?.indexing ? 'Connected' : 'Not Connected')}
            icon={Database}
            trend="Provider status"
            trendType="neutral"
            linkTo="/control-center/integrations"
          />
          <MetricCard 
            title="Revenue Tracking" 
            value={summaryLoading ? null : (summary?.revenue ? 'Connected' : 'Not Connected')}
            icon={ArrowUpRight}
            trend="Provider status"
            trendType="neutral"
            linkTo="/control-center/integrations"
          />
        </div>
      )}

      {activeProjectId && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes across your integrations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                Activity feed will appear here when connected to external providers.
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Configuration and status for the active property.</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : summary?.project ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Domain</span>
                    <span className="font-mono text-sm font-medium">{summary.project.domain}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={summary.project.status === 'active' ? 'default' : 'secondary'}>
                      {summary.project.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Calculators</span>
                    <span className="font-mono text-sm">{summary.project.constructionToolCount}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Could not load project details.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendType, linkTo }: any) {
  return (
    <Card className="hover:border-primary/50 transition-colors group relative overflow-hidden">
      <Link href={linkTo} className="absolute inset-0 z-10" aria-label={`Go to ${title}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold font-mono tracking-tight">{value}</div>
        )}
        <p className={`text-xs mt-1 ${
          trendType === 'destructive' ? 'text-destructive' : 
          trendType === 'warning' ? 'text-accent' : 
          trendType === 'good' ? 'text-primary' : 
          'text-muted-foreground'
        }`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
