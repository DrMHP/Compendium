import { useState, useMemo } from 'react';
import { Analysis } from './types';
import { supabase } from './lib/supabase';

type Props = {
  analyses: Analysis[];
};

function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <div className="relative inline-block group ml-1">
      <svg 
        className="w-4 h-4 text-gray-500 inline-block" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {tooltip}
      </div>
    </div>
  );
}

function AnalysisForm({
  type,
  initial,
}: {
  type: "add" | "edit";
  initial?: Analysis;
}) {
  const [suggestion, setSuggestion] = useState<Analysis>(initial || {
    name: '',
    laboratory: '',
    sector: '',
    form: '',
    sampleType: '',
    device: '',
    frequency: '',
    tat: '',
    units: '',
    referenceValues: '',
    stability: '',
    inamiCode: ''
  });
  const [authorName, setAuthorName] = useState("");
  const [authorLab, setAuthorLab] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");  // Nouveau state
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestion.name || !suggestion.laboratory || !authorName || !authorLab || !authorEmail) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Conserver l'ID lors d'une modification
      const suggestionData = type === 'edit' ? 
        { ...suggestion, id: initial?.id } : 
        suggestion;

      const { data, error: supabaseError } = await supabase
        .from('suggestions')
        .insert([
          {
            analysis: suggestionData,
            type: type,
            author_name: authorName,
            author_lab: authorLab,
            author_email: authorEmail,  // Ajout de l'email
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (supabaseError) {
        throw supabaseError;
      }

      // Réinitialiser le formulaire
      setSuggestion({
        name: '',
        laboratory: '',
        sector: '',
        form: '',
        sampleType: '',
        device: '',
        frequency: '',
        tat: '',
        units: '',
        referenceValues: '',
        stability: '',
        inamiCode: ''
      });
      setAuthorName('');
      setAuthorLab('');
      setAuthorEmail('');  // Reset email field
      setError('');
      
      alert('Suggestion enregistrée avec succès!');
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError('Erreur lors de l\'enregistrement de la suggestion');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'analyse* :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.name}
            onChange={e => setSuggestion(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Laboratoire* :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.laboratory}
            onChange={e => setSuggestion(f => ({ ...f, laboratory: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Secteur
            <InfoIcon tooltip="Hématologie? Microbiologie? Biochimie?" />
          </label>
          <input
            type="text"
            value={suggestion.sector || ''}
            onChange={(e) => setSuggestion(prev => ({ ...prev, sector: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formulaire
            <InfoIcon tooltip="Faut-il un formulaire pour l'envoi ? Insérer le lien vers le formulaire." />
          </label>
          <textarea
            value={suggestion.form || ''}
            onChange={(e) => setSuggestion(prev => ({ ...prev, form: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'échantillon :
            <InfoIcon tooltip="EDTA? Serum EDTA? etc.." />
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.sampleType || ""}
            onChange={e => setSuggestion(f => ({ ...f, sampleType: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appareil :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.device || ""}
            onChange={e => setSuggestion(f => ({ ...f, device: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fréquence :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.frequency || ""}
            onChange={e => setSuggestion(f => ({ ...f, frequency: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TAT :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.tat || ""}
            onChange={e => setSuggestion(f => ({ ...f, tat: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unités :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.units || ""}
            onChange={e => setSuggestion(f => ({ ...f, units: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valeurs de référence :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.referenceValues || ""}
            onChange={e => setSuggestion(f => ({ ...f, referenceValues: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stabilité :
            <InfoIcon tooltip="Quelles sont les conditions pré-analytiques (2–8 °C et/ou congélation) ?" />
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.stability || ""}
            onChange={e => setSuggestion(f => ({ ...f, stability: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code INAMI :
            <InfoIcon tooltip="Existe-t-il un code de remboursement ? Veuillez visiter Nomensoft pour consulter les codes de nomenclature." />
          </label>
          <input
            className="border rounded p-2 w-full"
            value={suggestion.inamiCode || ""}
            onChange={e => setSuggestion(f => ({ ...f, inamiCode: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">  {/* Changé de flex à grid-cols-3 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre nom* :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre laboratoire* :
          </label>
          <input
            className="border rounded p-2 w-full"
            value={authorLab}
            onChange={e => setAuthorLab(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre email* :
          </label>
          <input
            type="email"
            className="border rounded p-2 w-full"
            value={authorEmail}
            onChange={e => setAuthorEmail(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <button type="submit" className="bg-blue-700 text-white rounded p-2 font-semibold hover:bg-blue-800">
        Envoyer
      </button>
    </form>
  );
}

const SuggestionPage = ({ analyses }: Props) => {
  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [search, setSearch] = useState("");
  const [editResults, setEditResults] = useState<Analysis[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedLab, setSelectedLab] = useState<string>("");

  // Extraire les secteurs et laboratoires uniques
  const uniqueSectors = useMemo(() => {
    const sectors = new Set(analyses.map(a => a.sector).filter(Boolean));
    return Array.from(sectors).sort();
  }, [analyses]);

  const uniqueLabs = useMemo(() => {
    const labs = new Set(analyses.map(a => a.laboratory));
    return Array.from(labs).sort();
  }, [analyses]);

  // Recherche pour modification avec filtres
  function handleEditSearch(val: string) {
    setSearch(val);
    updateResults(val, selectedSector, selectedLab);
  }

  // Mise à jour des résultats basée sur tous les filtres
  function updateResults(searchVal: string, sector: string, lab: string) {
    if (!searchVal && !sector && !lab) {
      setEditResults([]);
      return;
    }

    const filtered = analyses.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchVal.toLowerCase());
      const matchesSector = !sector || a.sector === sector;
      const matchesLab = !lab || a.laboratory === lab;
      return matchesSearch && matchesSector && matchesLab;
    });

    setEditResults(filtered.slice(0, 10));
  }

  // Fonction pour annuler la sélection
  const handleCancel = () => {
    setSelected(null);
    setSearch('');
    setEditResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
      {!mode && (
        <div className="space-y-4">
          <button
            onClick={() => setMode("add")}
            className="w-full p-4 text-left border rounded hover:bg-gray-50"
          >
            Suggérer une nouvelle analyse
          </button>
          <button
            onClick={() => setMode("edit")}
            className="w-full p-4 text-left border rounded hover:bg-gray-50"
          >
            Suggérer une modification
          </button>
        </div>
      )}
      
      {mode === "add" && <AnalysisForm type="add" />}
      {mode === "edit" && (
        <div>
          {!selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="border rounded p-2 w-full"
                  type="text"
                  value={search}
                  onChange={e => handleEditSearch(e.target.value)}
                  placeholder="Rechercher une analyse..."
                />
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    updateResults(search, e.target.value, selectedLab);
                  }}
                  className="p-2 border rounded bg-white"
                >
                  <option value="">Tous les secteurs</option>
                  {uniqueSectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLab}
                  onChange={(e) => {
                    setSelectedLab(e.target.value);
                    updateResults(search, selectedSector, e.target.value);
                  }}
                  className="p-2 border rounded bg-white"
                >
                  <option value="">Tous les laboratoires</option>
                  {uniqueLabs.map(lab => (
                    <option key={lab} value={lab}>
                      {lab}
                    </option>
                  ))}
                </select>
              </div>

              {editResults.length > 0 ? (
                <div className="border rounded-lg divide-y">
                  {editResults.map((a) => (
                    <button
                      key={a.name}
                      onClick={() => setSelected(a)}
                      className="w-full p-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{a.name}</span>
                        <span className="text-sm text-gray-600">
                          {a.laboratory}
                          {a.sector && ` • ${a.sector}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : search || selectedSector || selectedLab ? (
                <div className="text-center py-4 text-gray-500">
                  Aucune analyse trouvée
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Commencez à taper pour rechercher des analyses
                </div>
              )}
            </div>
          )}

          {selected && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Modification de : {selected.name}
                </h3>
                <button
                  onClick={() => {
                    setSelected(null);
                    setSearch('');
                    setEditResults([]);
                    setSelectedSector('');
                    setSelectedLab('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                  Annuler
                </button>
              </div>
              <AnalysisForm type="edit" initial={selected} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionPage;
