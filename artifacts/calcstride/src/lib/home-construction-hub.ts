import type { Tool } from '@workspace/api-client-react';

export const getHomeConstructionRelatedTools = (tools: readonly Tool[]) => ({
  btuTool: tools.find((tool) => tool.slug === 'btu'),
  electricalTools: tools.filter((tool) => tool.categorySlug === 'electrical'),
});
