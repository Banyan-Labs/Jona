
import { getUserServer } from '@/supabase/user';
import AppShell from '@/components/AppShell'; // or Dashboard if directly
import type { AuthUser } from '@/types/application';
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getUserServer();
   if (!user) {
    redirect("/login");
   }
return (
  // <AppShell initialUser={user as AuthUser | null}>

    <div />
  // </AppShell>
);
}
