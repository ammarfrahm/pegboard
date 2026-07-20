import { Link } from '@tanstack/react-router';
import { Minimize2, Type, Braces, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const tools: {
  to: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
}[] = [
  {
    to: '/compress',
    icon: Minimize2,
    tag: 'Images',
    title: 'Image compressor',
    description:
      'Shrink file sizes without wrecking quality. Batch-process a whole folder with presets or custom settings.',
  },
  {
    to: '/overlay',
    icon: Type,
    tag: 'Images',
    title: 'Text overlay',
    description:
      'Drop text onto an image and drag it into place. Fonts, colors, shadows, and pixel-precise export.',
  },
  {
    to: '/json',
    icon: Braces,
    tag: 'Data',
    title: 'JSON formatter',
    description:
      'Format, minify, and unescape JSON. Explore the result as a collapsible tree and share it as a link.',
  },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-14 mt-6 text-center">
        <h1 className="font-display mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Every tool on its hook.
        </h1>
        <p className="mx-auto max-w-md text-lg text-subtle">
          A pegboard of small, sharp utilities. Grab one, use it, hang it back.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tools.map((tool, i) => (
          <Link
            key={tool.to}
            to={tool.to}
            className={`tool-card group block p-6 pt-4 animate-fade-up delay-${(i + 1) * 100}`}
          >
            {/* Peg holes: punched through to the wall behind */}
            <div className="mb-5 flex justify-center gap-10">
              <span className="peg-hole" />
              <span className="peg-hole" />
            </div>

            <div className="tool-icon mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <tool.icon className="h-6 w-6 text-accent-ink" />
            </div>

            <p className="tape-label mb-1.5">{tool.tag}</p>
            <h2 className="font-display mb-2 text-lg tracking-tight transition-colors group-hover:text-accent">
              {tool.title}
            </h2>
            <p className="text-sm leading-relaxed text-subtle">{tool.description}</p>
          </Link>
        ))}
      </div>

      {/* Privacy note */}
      <div className="mt-14 flex items-center justify-center gap-3 text-xs text-subtle">
        <div className="h-px max-w-[60px] flex-1 bg-line" />
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>100% client-side — your files never leave the browser</span>
        <div className="h-px max-w-[60px] flex-1 bg-line" />
      </div>
    </div>
  );
}
