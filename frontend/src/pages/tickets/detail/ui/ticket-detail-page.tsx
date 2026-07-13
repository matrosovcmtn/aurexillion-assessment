import { Navigate, useParams } from "react-router";

function parseTicketId(value: string | undefined): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** Deep-link compatibility: `/tickets/:id` opens the workspace sheet. */
export function TicketDetailPage() {
  const { ticketId: ticketIdParam } = useParams();
  const ticketId = parseTicketId(ticketIdParam);

  if (ticketId === null) {
    return <Navigate to="/?view=list" replace />;
  }

  return <Navigate to={`/?view=list&ticket=${ticketId}`} replace />;
}
