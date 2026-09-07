import { useState } from 'react';
import { useListProjects, useGetDashboardSummary } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BarChart3, DollarSign, Database, Activity, Calculator, Blocks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function StatusModule({ type, sectionId }: { type: 'seo' | 'traffic' | 'revenue' | 'calculators' | 'indexing' | 'health', sectionId: string }) {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const activeProjectId = selectedProjectId || (projects?.[0]?.id) || null;

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary(activeProjectId!, {
    query: {
      enabled: !!activeProjectId,
      queryKey: ['dashboard', activeProjectId]
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

  const renderContent = () => {
    switch (type) {
      case 'seo':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                Search Console Connection
              </CardTitle>
              <CardDescription>Google Search Console indexing and ranking status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg bg-muted/5">
                <Badge variant="outline" className="mb-4 text-muted-foreground">Not Connected</Badge>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Google Search Console is not connected for this property. Connect it in the Integrations tab to view SEO metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'traffic':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                Traffic Analytics
              </CardTitle>
              <CardDescription>Visitor metrics and user engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg bg-muted/5">
                <Badge variant="outline" className="mb-4 text-muted-foreground">Not Connected</Badge>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Google Analytics 4 is not connected. Connect it in Integrations to track traffic.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'revenue':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Monetization
              </CardTitle>
              <CardDescription>Ad revenue and affiliate tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg bg-muted/5">
                <Badge variant="outline" className="mb-4 text-muted-foreground">Not Connected</Badge>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Google AdSense is not connected. Revenue metrics are currently unavailable.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'indexing':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                Search Indexing
              </CardTitle>
              <CardDescription>Sitemap and page indexation status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg bg-muted/5">
                <Badge variant="outline" className="mb-4 text-muted-foreground">Unavailable</Badge>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Index status requires Search Console integration.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'health':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                Site Health
              </CardTitle>
              <CardDescription>Core web vitals and uptime monitoring.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg bg-muted/5">
                <Badge variant="outline" className="mb-4 text-muted-foreground">No Data</Badge>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Site health checks have not recorded any data for this project yet.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'calculators':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Construction Tools
                </CardTitle>
                <CardDescription>Active calculators available to users.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold font-mono tracking-tight mb-2">
                  {summary?.project.constructionToolCount ?? '--'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Standard construction calculators are active in this project.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Catalog Status</CardTitle>
                <CardDescription>Availability of specialized modules.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Public Routes</span>
                    <span className="font-mono text-sm font-medium">{summary?.project?.publicRouteCount ?? '--'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Catalog Sync</span>
                    <Badge variant="outline">No sync data</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {projectsLoading ? (
          <Skeleton className="h-10 w-[200px]" />
        ) : (
          <Select value={activeProjectId || undefined} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[250px] font-mono text-sm">
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
      
      {renderContent()}
    </div>
  );
}
