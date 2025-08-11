
import { getUserServer } from '@/app/supabase/user';
import AppShell from '@/app/components/AppShell'; // or Dashboard if directly
import type { AuthUser } from '@/app/types/application';
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
