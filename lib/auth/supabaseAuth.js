import { supabase } from "../supabase/client.js";
import { loadStoreFromSupabase } from "../db/loadStore.js";

/** Map profile + salary to app user shape (no password field) */
export async function fetchAppUserByAuthId(authUserId) {
  try {
    const store = await loadStoreFromSupabase();

    if (!store?.users) return null;

    return store.users.find((u) => u.id === authUserId) || null;
  } catch (err) {
    console.error("fetchAppUserByAuthId error:", err);
    return null;
  }
}

/** LOGIN */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ok: false, error: error.message };

  const appUser = await fetchAppUserByAuthId(data.user.id);

  if (!appUser) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "User profile missing. Please contact admin.",
    };
  }

  if (appUser.active === false) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Account is inactive. Contact admin.",
    };
  }

  return { ok: true, user: appUser, session: data.session };
}

/** FIRST ADMIN SIGNUP */
export async function signUpAdmin({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "admin" },
    },
  });

  if (error) return { ok: false, error: error.message };

  if (data.user) {
    // FIX: insert/update safe
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      role: "admin",
      name,
      tour_done: true,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError.message);
    }
  }

  return {
    ok: true,
    user: data.user,
    needsEmailConfirm: !data.session,
  };
}

/** STAFF SIGNUP */
export async function signUpStaff({
  email,
  password,
  name,
  role = "staff",
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });

  if (error) return { ok: false, error: error.message };

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      role,
      name,
      tour_done: false,
    });
  }

  return { ok: true, userId: data.user?.id };
}

/** SIGN OUT */
export async function signOut() {
  await supabase.auth.signOut();
}

/** GET SESSION USER */
export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();

  if (!data.session?.user) return null;

  return await fetchAppUserByAuthId(data.session.user.id);
}

/** AUTH STATE LISTENER */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const appUser = await fetchAppUserByAuthId(session.user.id);
      callback(event, appUser);
    } else {
      callback(event, null);
    }
  });
}
