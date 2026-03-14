import type { Metadata } from "next";
import InviteClient from "./invite-client";

export const metadata: Metadata = {
  title: "Invite",
};

export default function InvitePage() {
  return <InviteClient />;
}
