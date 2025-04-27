import { supabase } from './supabase';

async function testSupabaseConnection() {
  try {
    // Test simple select query
    const { data, error } = await supabase
      .from('analyses')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }

    console.log('✅ Connexion à Supabase réussie!');
    return true;
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
    return false;
  }
}

// Exécuter le test
testSupabaseConnection();