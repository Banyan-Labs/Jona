'use server';

import { createAdminUser, insertAdminUser } from '@/supabase/admin';

export async function handleCreateAdmin() {
  const email = 'admin@eadmin.com';
  const password = 'admin';

  const { user } = await createAdminUser(email, password);

  if (!user || !user.id) {
    throw new Error('Failed to create admin user');
  }

  await insertAdminUser(user.id);
console.log(`Admin user created: ${user.email} (${user.id})`);
  return user;
}

