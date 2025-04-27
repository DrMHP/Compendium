import { insertSuggestion } from '../lib/db'
import { useState } from 'react'

// Ajoutez ceci dans votre composant
const [error, setError] = useState(null)

// Dans votre fonction de soumission :
const handleSubmit = async (e) => {
    e.preventDefault()
    
    const suggestion = {
        name: suggestionName,
        laboratory: suggestionLaboratory,
        // ...autres champs
    }

    try {
        const success = await insertSuggestion(suggestion)
        if (success) {
            // Réinitialiser le formulaire
            setSuggestionName('')
            setSuggestionLaboratory('')
            // Afficher un message de succès
            alert('Suggestion envoyée avec succès!')
        } else {
            setError('Erreur lors de l\'enregistrement de la suggestion')
        }
    } catch (err) {
        setError(`Erreur : ${err.message}`)
        console.error('Erreur complète:', err)
    }
}