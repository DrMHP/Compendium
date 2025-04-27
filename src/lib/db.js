import { supabase } from './supabaseClient'

export async function insertSuggestion(suggestion) {
    try {
        const { data, error } = await supabase
            .from('suggestions')  // nom de votre table
            .insert([suggestion])

        if (error) {
            console.error('Erreur lors de l\'insertion:', error)
            return false
        }

        return true
    } catch (err) {
        console.error('Erreur:', err)
        return false
    }
}