export default function ExhibitionsLoading() {
return (
<div className="px-4 py-12">
<div className="mx-auto max-w-6xl">
<div className="mb-10">
<div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-muted" />
<div className="h-5 w-80 animate-pulse rounded-lg bg-muted/60" />
</div>
<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
{[1, 2, 3].map((i) => (
<div key={i} className="card overflow-hidden">
<div className="aspect-[16/10] animate-pulse bg-muted" />
<div className="space-y-3 p-5">
<div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
<div className="h-4 w-full animate-pulse rounded bg-muted/60" />
<div className="h-3 w-1/2 animate-pulse rounded bg-muted/40" />
</div>
</div>
))}
</div>
</div>
</div>
)
}
