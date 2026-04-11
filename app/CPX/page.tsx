import { redirect } from "next/navigation";

export default function CpxDisabledPage() {
  redirect("/dashboard");
}

