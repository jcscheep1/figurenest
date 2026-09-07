import { ChevronRight } from 'lucide-react';
import { Link } from '@/components/PublicLink';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';

export function SiteBreadcrumbs({ path, isPrivate = false }: { path: string; isPrivate?: boolean }) {
  if (isPrivate) return null;
  const items = getBreadcrumbItems(path);
  if (items.length === 0) return null;

  return (
    <nav className="site-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.label}`}>
              {index > 0 && <ChevronRight className="site-breadcrumb-separator" size={13} aria-hidden="true" />}
              {current
                ? <span aria-current="page">{item.label}</span>
                : <Link href={item.path}>{item.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}