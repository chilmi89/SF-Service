import { supabaseAdmin } from './supabaseAdmin';

/**
 * Validasi apakah profile user sudah lengkap (Nama & Telepon).
 * Digunakan untuk membatasi akses ke fitur tertentu seperti pendaftaran tenant.
 */
export async function checkProfileCompletion(userId: string) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return { 
        isComplete: false, 
        message: 'Data profil tidak ditemukan.' 
      };
    }

    // Cek apakah kolom wajib sudah terisi
    const isComplete = !!(profile.full_name && profile.phone);

    if (!isComplete) {
      return { 
        isComplete: false, 
        message: 'Profil belum lengkap. Silakan lengkapi Nama Lengkap dan Nomor Telepon di pengaturan profil Anda.' 
      };
    }

    return { isComplete: true, profile };
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return { isComplete: false, message: 'Terjadi kesalahan saat memvalidasi profil.' };
  }
}
