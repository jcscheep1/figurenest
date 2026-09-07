import { useState } from 'react';
import { useListProjects, useCreateProject, useArchiveProject, getListProjectsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Archive, ExternalLink, Blocks, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function Projects() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const archiveProject = useArchiveProject();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [search, setSearch] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDomain) return;
    
    createProject.mutate({ data: { name: newName, domain: newDomain } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setCreateOpen(false);
        setNewName('');
        setNewDomain('');
      }
    });
  };

  const handleArchive = (id: string) => {
    if (confirm('Archive this project? This will hide it from the active dashboard.')) {
      archiveProject.mutate({ projectId: id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        }
      });
    }
  };

  const filtered = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Add a new property to your operations console.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. FigureNest Main" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Primary Domain</Label>
                  <Input 
                    id="domain" 
                    placeholder="e.g. figurenest.com" 
                    value={newDomain} 
                    onChange={e => setNewDomain(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProject.isPending}>
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </>
        ) : filtered?.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/20">
            <Blocks className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search ? 'Try adjusting your search terms.' : 'Create your first project to start tracking your properties.'}
            </p>
          </div>
        ) : (
          filtered?.map((project) => (
            <Card key={project.id} className={`group relative transition-all duration-200 hover:shadow-md hover:border-primary/40 ${project.status === 'archived' ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="font-mono mt-1 text-xs truncate max-w-[200px]">
                      {project.domain}
                    </CardDescription>
                  </div>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/30 p-2 rounded border">
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-1">Calculators</span>
                      <span className="font-mono font-medium">{project.constructionToolCount}</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded border">
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-1">Pages</span>
                      <span className="font-mono font-medium">{project.publicRouteCount ?? '--'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" asChild>
                      <a href={project.domain} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} /> Open Site
                      </a>
                    </Button>
                    {project.status === 'active' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" 
                        onClick={() => handleArchive(project.id)}
                        disabled={archiveProject.isPending}
                        title="Archive Project"
                      >
                        <Archive size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
