export default function AddEventSpecialFormSkeleton() {
  return (
    <div className="min-h-dvh bg-off-white font-urbanist">
      <div className="mx-auto max-w-[920px] px-4 pt-10 pb-16 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-24 rounded-md bg-charcoal/8" />
          <div className="h-4 w-3 rounded bg-charcoal/6" />
          <div className="h-4 w-20 rounded-md bg-charcoal/8" />
        </div>

        {/* Hero skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 w-48 rounded-lg bg-charcoal/8 mx-auto mb-3" />
          <div className="h-4 w-72 rounded-md bg-charcoal/6 mx-auto" />
        </div>

        {/* Section 1: Publishing Context */}
        <div className="rounded-[12px] border border-charcoal/10 bg-white shadow-md px-6 py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-charcoal/8" />
            <div className="h-5 w-36 rounded-md bg-charcoal/8" />
          </div>
          <div className="h-12 w-full rounded-full bg-charcoal/6" />
        </div>

        {/* Section 2: Details */}
        <div className="rounded-[12px] border border-charcoal/10 bg-white shadow-md px-6 py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-charcoal/8" />
            <div className="h-5 w-32 rounded-md bg-charcoal/8" />
          </div>
          <div className="space-y-5">
            <div className="h-12 w-full rounded-full bg-charcoal/6" />
            <div className="h-28 w-full rounded-[12px] bg-charcoal/6" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 rounded-full bg-charcoal/6" />
              <div className="h-12 rounded-full bg-charcoal/6" />
            </div>
            <div className="h-12 w-full rounded-full bg-charcoal/6" />
          </div>
        </div>

        {/* Section 3: Media */}
        <div className="rounded-[12px] border border-charcoal/10 bg-white shadow-md px-6 py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-charcoal/8" />
            <div className="h-5 w-24 rounded-md bg-charcoal/8" />
          </div>
          <div className="h-32 w-full rounded-[12px] bg-charcoal/6 border-2 border-dashed border-charcoal/10" />
        </div>

        {/* Submit button skeleton */}
        <div className="h-14 w-full rounded-full bg-charcoal/8" />
      </div>
    </div>
  );
}
