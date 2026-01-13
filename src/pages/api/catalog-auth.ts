import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password')?.toString() || '';

  // Get valid passwords from environment variable
  const validPasswords = (import.meta.env.CATALOG_PASSWORD || '')
    .split(',')
    .map((p: string) => p.trim())
    .filter(Boolean);

  if (validPasswords.includes(password)) {
    // Set secure HTTP-only cookie (expires in 24 hours)
    cookies.set('catalog_auth', 'authenticated', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return redirect('/catalog', 302);
  }

  // Invalid password - redirect back with error
  return redirect('/catalog?error=invalid', 302);
};

// Handle logout
export const DELETE: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('catalog_auth', { path: '/' });
  return redirect('/catalog', 302);
};
