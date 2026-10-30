import type { Metadata } from "next";
import { Suspense } from "react";

import { StaffLogin } from "@/components/admin/staff-login";

export const metadata: Metadata = { title: "Connexion équipe", robots: { index: false, follow: false } };

async function Login({ searchParams }: { searchParams: PageProps<"/admin/connexion">["searchParams"] }) {
  const sp = await searchParams;
  return <StaffLogin startAt2fa={sp.etape === "2fa"} />;
}

export default function AdminLoginPage(props: PageProps<"/admin/connexion">) {
  return (
    <Suspense fallback={<StaffLogin />}>
      <Login searchParams={props.searchParams} />
    </Suspense>
  );
}
