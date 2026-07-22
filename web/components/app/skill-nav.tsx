'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/shadcn/utils';
import { SKILL_META, type SkillId } from '@/lib/skill-content';

const SKILLS = Object.keys(SKILL_META) as SkillId[];

export function SkillNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="IELTS skills"
      className="border-border/70 bg-background/90 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-md md:top-0"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto px-4 py-3 md:px-6">
        <Link
          href="/"
          className={cn(
            'rounded-full px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors',
            pathname === '/'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          Home
        </Link>
        {SKILLS.map((skill) => {
          const meta = SKILL_META[skill];
          const active = pathname === meta.href || pathname.startsWith(`${meta.href}/`);
          return (
            <Link
              key={skill}
              href={meta.href}
              className={cn(
                'rounded-full px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors',
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {meta.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
