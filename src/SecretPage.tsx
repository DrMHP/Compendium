import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Analysis } from './types';

// Ajoutez ce type pour les messages de contact
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type Suggestion = {
  id: string;
  analysis: Analysis;
  type: 'add' | 'edit';
  author_name: string;
  author_lab: string;
  author_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export const SecretPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuggestions();
    }
  }, [isAuthenticated]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
      console.log('Suggestions chargées:', data); // Pour déboguer
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Ajouter cette fonction pour charger les messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleLogin = () => {
    if (code === 'a') {
      setIsAuthenticated(true);
      setError('');
      // Charger les suggestions depuis le localStorage
      const storedSuggestions = localStorage.getItem('suggestions');
      if (storedSuggestions) {
        const parsedSuggestions = JSON.parse(storedSuggestions);
        console.log('Suggestions chargées:', parsedSuggestions); // Debug
        setSuggestions(parsedSuggestions);
      }
    } else {
      setError('Code incorrect');
    }
  };

  const handleApprove = async (suggestion: Suggestion) => {
    try {
      console.log('Suggestion originale:', suggestion);

      const analysisData = {
        name: suggestion.analysis.name,
        laboratory: suggestion.analysis.laboratory,
        sector: suggestion.analysis.sector,
        form: suggestion.analysis.form,
        sample_type: suggestion.analysis.sampleType,
        device: suggestion.analysis.device,
        frequency: suggestion.analysis.frequency,
        tat: suggestion.analysis.tat,
        units: suggestion.analysis.units,
        reference_values: suggestion.analysis.referenceValues,
        stability: suggestion.analysis.stability,
        inami_code: suggestion.analysis.inamiCode
      };

      if (suggestion.type === 'edit' && suggestion.analysis.id) {
        // 1. Mettre à jour l'analyse
        const { error: analysisError } = await supabase
          .from('analyses')
          .update(analysisData)
          .eq('id', suggestion.analysis.id);

        if (analysisError) {
          console.error('Erreur de mise à jour de l\'analyse:', analysisError);
          throw analysisError;
        }
      } else if (suggestion.type === 'add') {
        // Cas d'un nouvel ajout
        const { error: insertError } = await supabase
          .from('analyses')
          .insert([analysisData]);

        if (insertError) {
          console.error('Erreur d\'insertion de l\'analyse:', insertError);
          throw insertError;
        }
      }

      // 2. Mettre à jour le statut de la suggestion
      const { error: statusError } = await supabase
        .from('suggestions')
        .update({ status: 'approved' })
        .eq('id', suggestion.id);

      if (statusError) {
        console.error('Erreur de mise à jour du statut:', statusError);
        throw statusError;
      }

      // 3. Rafraîchir la liste des suggestions
      await fetchSuggestions();

      // 4. Afficher un message de succès
      alert(suggestion.type === 'add' ? 
        'Nouvelle analyse ajoutée avec succès' : 
        'Analyse modifiée avec succès'
      );

    } catch (error) {
      console.error('Error approving suggestion:', error);
      alert('Erreur lors de l\'approbation : ' + (error as Error).message);
    }
  };

  const handleReject = (suggestion: Suggestion) => {
    const updatedSuggestions = suggestions.map(s => 
      s.id === suggestion.id 
        ? { ...s, status: 'rejected' as const } 
        : s
    );
    localStorage.setItem('suggestions', JSON.stringify(updatedSuggestions));
    setSuggestions(updatedSuggestions);
  };

  const handleDelete = async (suggestion: Suggestion) => {
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestion.id);

      if (error) throw error;
      await fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  // Ajouter cette fonction pour supprimer un message
  const handleDeleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Rafraîchir la liste après suppression
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleFieldChange = (suggestionId: string, field: keyof Analysis, value: string) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.map(suggestion => 
        suggestion.id === suggestionId 
          ? {
              ...suggestion,
              analysis: {
                ...suggestion.analysis,
                [field]: value
              }
            }
          : suggestion
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Page Administrateur</h2>
        <div className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Entrez le code administrateur"
            className="w-full p-2 border rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      {/* Déplacer le bouton des messages ici */}
      <div className="mb-8">
        <button
          onClick={() => {
            setShowMessages(!showMessages);
            if (!showMessages) {
              fetchMessages();
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showMessages ? 'Masquer les messages' : 'Voir les messages'}
        </button>

        {showMessages && (
          <div className="mt-4 space-y-4">
            <h3 className="text-xl font-bold mb-4">Messages de contact</h3>
            {messages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{message.name}</p>
                    <p className="text-sm text-gray-600">{message.email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString('fr-FR')}
                    </p>
                    <p className="mt-2">{message.message}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
                        handleDeleteMessage(message.id);
                      }
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-gray-500 text-center">Aucun message</p>
            )}
          </div>
        )}
      </div>

      {/* Puis le reste du contenu */}
      <h2 className="text-2xl font-bold mb-6">Suggestions en attente</h2>
      {suggestions.length === 0 ? (
        <p className="text-gray-500">Aucune suggestion en attente.</p>
      ) : (
        <div className="space-y-6">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id}
              className="border rounded-lg p-4 bg-white space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">
                  {suggestion.analysis.name}
                </h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {suggestion.status}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold">Nom</dt>
                  <dd>
                    <input
                      type="text"
                      value={suggestion.analysis.name}
                      onChange={(e) => handleFieldChange(suggestion.id, 'name', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Laboratoire</dt>
                  <dd>
                    <input
                      type="text"
                      value={suggestion.analysis.laboratory}
                      onChange={(e) => handleFieldChange(suggestion.id, 'laboratory', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Auteur</dt>
                  <dd>{suggestion.author_name}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Laboratoire de l'auteur</dt>
                  <dd>{suggestion.author_lab}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Email de l'auteur</dt>
                  <dd>{suggestion.author_email}</dd>
                </div>
                {suggestion.analysis.sampleType && (
                  <div>
                    <dt className="font-semibold">Type d'échantillon</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.sampleType || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'sampleType', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.device && (
                  <div>
                    <dt className="font-semibold">Appareil</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.device || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'device', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.frequency && (
                  <div>
                    <dt className="font-semibold">Fréquence</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.frequency || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'frequency', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.tat && (
                  <div>
                    <dt className="font-semibold">TAT</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.tat || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'tat', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.units && (
                  <div>
                    <dt className="font-semibold">Unités</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.units || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'units', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.referenceValues && (
                  <div>
                    <dt className="font-semibold">Valeurs de référence</dt>
                    <dd>
                      <textarea
                        value={suggestion.analysis.referenceValues || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'referenceValues', e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.stability && (
                  <div>
                    <dt className="font-semibold">Stabilité</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.stability || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'stability', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                {suggestion.analysis.inamiCode && (
                  <div>
                    <dt className="font-semibold">Code INAMI</dt>
                    <dd>
                      <input
                        type="text"
                        value={suggestion.analysis.inamiCode || ''}
                        onChange={(e) => handleFieldChange(suggestion.id, 'inamiCode', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold">Secteur</dt>
                  <dd>
                    <input
                      type="text"
                      value={suggestion.analysis.sector || ''}
                      onChange={(e) => handleFieldChange(suggestion.id, 'sector', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Formulaire</dt>
                  <dd>
                    <textarea
                      value={suggestion.analysis.form || ''}
                      onChange={(e) => handleFieldChange(suggestion.id, 'form', e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                  </dd>
                </div>
              </dl>

              <div className="text-sm text-gray-500 mt-2">
                Soumis le : {new Date(suggestion.created_at).toLocaleDateString('fr-BE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              <div className="flex gap-4 mt-4">
                {suggestion.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(suggestion)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(suggestion)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(suggestion)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-auto"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecretPage;