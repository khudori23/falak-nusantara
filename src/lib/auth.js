import { supabase } from './supabase';

// Kirim OTP ke email user
export async function signInWithOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

// Verifikasi kode OTP yang dimasukkan user
export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data.session;
}

// Sesi anonim — untuk fitur tanpa akun (kiblat, kompas, dsb tetap jalan tanpa login)
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
