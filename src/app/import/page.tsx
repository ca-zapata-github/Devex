import { redirect } from "next/navigation";

import { hasEditAccess } from "@/lib/auth/edit-access";

import { ImportForm } from "./ImportForm";

export default async function ImportPage() {
  if (!(await hasEditAccess())) {
    redirect("/login");
  }

  return <ImportForm />;
}
