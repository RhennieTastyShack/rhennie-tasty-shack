import { redirect } from "next/navigation";

/** Catering now lives under Event Concierge. */
export default function CateringRedirectPage() {
  redirect("/event-concierge");
}
