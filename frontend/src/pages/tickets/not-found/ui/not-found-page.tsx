import { Link } from "react-router";

import { buttonVariants } from "@/shared/ui/button";

export function NotFoundPage() {
  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you requested does not exist or the link is incorrect.
        </p>
      </div>
      <Link to="/?view=list" className={buttonVariants({ size: "lg" })}>
        Back to tickets
      </Link>
    </section>
  );
}
