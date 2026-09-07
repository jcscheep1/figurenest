import { Link as WouterLink, type LinkProps } from 'wouter';
import { toPublicPath } from '@/lib/public-url';

type PublicLinkProps = Extract<LinkProps, { href: string }>;

export function Link({ href, ...props }: PublicLinkProps) {
  return <WouterLink {...props} href={toPublicPath(href)} />;
}