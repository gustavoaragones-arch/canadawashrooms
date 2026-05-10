import type { ReactNode } from 'react'

export function EditorialChrome({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <article className="border-b border-cwr-border bg-cwr-surface">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:max-w-[42rem] lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cwr-accent">{kicker}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">{title}</h1>
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-cwr-muted sm:text-[0.9375rem] sm:leading-[1.65]">
          {children}
        </div>
      </div>
    </article>
  )
}

export function EditorialSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: ReactNode
}) {
  return (
    <section {...(id ? { id } : {})} className="scroll-mt-28">
      <h2 className="text-lg font-semibold tracking-tight text-cwr-ink">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}
