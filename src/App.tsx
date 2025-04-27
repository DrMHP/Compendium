import { useState, useEffect, useMemo } from "react";
import { supabase } from './lib/supabase';
import { Analysis } from './types';
import ContactForm from "./ContactForm";
import SuggestionPage from "./SuggestionPage";
import SecretPage from "./SecretPage";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [page, setPage] = useState<"main" | "contact" | "suggestion" | "secret">("main");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedLab, setSelectedLab] = useState<string>("");

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*');

        if (error) throw error;
        setAnalyses(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des analyses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyses();
  }, []);

  // Extraire les secteurs et laboratoires uniques
  const uniqueSectors = useMemo(() => {
    const sectors = new Set(analyses.map(a => a.sector).filter(Boolean));
    return Array.from(sectors).sort();
  }, [analyses]);

  const uniqueLabs = useMemo(() => {
    const labs = new Set(analyses.map(a => a.laboratory));
    return Array.from(labs).sort();
  }, [analyses]);

  // Filtrer les analyses basées sur tous les critères
  const searchResults = useMemo(() => {
    // Ne retourner des résultats que si au moins un critère de recherche est présent
    if (!searchQuery && !selectedSector && !selectedLab) {
      return [];
    }
    
    return analyses.filter(analysis => {
      const matchesSearch = analysis.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = !selectedSector || analysis.sector === selectedSector;
      const matchesLab = !selectedLab || analysis.laboratory === selectedLab;
      return matchesSearch && matchesSector && matchesLab;
    }).slice(0, 10);
  }, [analyses, searchQuery, selectedSector, selectedLab]);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6Lf6giYrAAAAACxiDVblZGnWU3-zVvmE2_2iXeTe"
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Navigation */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm p-4 flex justify-between items-center border-b">
          <div className="flex gap-4 items-center">
            <button
              className={`font-semibold hover:underline ${page === "main" ? "text-blue-700" : ""}`}
              onClick={() => setPage("main")}
            >
              Accueil
            </button>
            <button
              className={`hover:underline ${page === "suggestion" ? "text-blue-700" : ""}`}
              onClick={() => setPage("suggestion")}
            >
              Suggestion
            </button>
            <button
              className={`hover:underline ${page === "secret" ? "text-blue-700" : ""} text-xs border px-2 py-1 rounded ml-2`}
              onClick={() => setPage("secret")}
            >
              Admin
            </button>
          </div>
          <button
            className={`hover:underline ${page === "contact" ? "text-blue-700" : ""}`}
            onClick={() => setPage("contact")}
          >
            Contactez-nous
          </button>
        </header>

        {/* Titre principal */}
        <div className="w-full max-w-4xl mx-auto mt-8 mb-2 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Compendium d'analyses des laboratoires en Belgique
          </h1>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4">
          {page === "main" && (
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex flex-col gap-8">
                <div className="space-y-4">
                  {/* Barre de recherche et filtres */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher une analyse..."
                      className="p-2 border rounded-lg"
                    />
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="p-2 border rounded-lg bg-white"
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
                      onChange={(e) => setSelectedLab(e.target.value)}
                      className="p-2 border rounded-lg bg-white"
                    >
                      <option value="">Tous les laboratoires</option>
                      {uniqueLabs.map(lab => (
                        <option key={lab} value={lab}>
                          {lab}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Résultats de recherche */}
                  {loading ? (
                    <div className="text-center py-4">
                      Chargement des analyses...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {searchResults.map((analysis) => (
                        <button
                          key={analysis.id}
                          onClick={() => setSelectedAnalysis(analysis)}
                          className="w-full p-4 text-left hover:bg-gray-50"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">{analysis.name}</span>
                            <span className="text-sm text-gray-600">
                              {analysis.laboratory}
                              {analysis.sector && ` • ${analysis.sector}`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (searchQuery || selectedSector || selectedLab) ? (
                    <div className="text-center py-4 text-gray-500">
                      Aucune analyse trouvée
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Commencez à taper pour rechercher des analyses
                    </div>
                  )}
                </div>
                {selectedAnalysis && (
                  <div className="border rounded-lg p-4 mt-4">
                    <h2 className="text-xl font-bold mb-4">{selectedAnalysis.name}</h2>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="font-semibold">Laboratoire</dt>
                        <dd>{selectedAnalysis.laboratory}</dd>
                      </div>
                      
                      {selectedAnalysis.sector && (
                        <div>
                          <dt className="font-semibold">Secteur</dt>
                          <dd>{selectedAnalysis.sector}</dd>
                        </div>
                      )}
                      
                      {selectedAnalysis.form && (
                        <div>
                          <dt className="font-semibold">Formulaire</dt>
                          <dd>{selectedAnalysis.form}</dd>
                        </div>
                      )}

                      {selectedAnalysis.sampleType && (
                        <div>
                          <dt className="font-semibold">Type d'échantillon</dt>
                          <dd>{selectedAnalysis.sampleType}</dd>
                        </div>
                      )}
                      
                      <div>
                        <dt className="font-semibold">Appareil</dt>
                        <dd>{selectedAnalysis.device || <span className="text-gray-400">-</span>}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Fréquence</dt>
                        <dd>{selectedAnalysis.frequency || <span className="text-gray-400">-</span>}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">TAT</dt>
                        <dd>{selectedAnalysis.tat || <span className="text-gray-400">-</span>}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Unités</dt>
                        <dd>{selectedAnalysis.units || <span className="text-gray-400">-</span>}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Valeurs de référence</dt>
                        <dd>{selectedAnalysis.referenceValues || <span className="text-gray-400">-</span>}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Stabilité</dt>
                        <dd>{selectedAnalysis.stability || <span className="text-gray-400">-</span>}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Code INAMI</dt>
                        <dd>{selectedAnalysis.inamiCode || <span className="text-gray-400">-</span>}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </div>
          )}
          {page === "contact" && <ContactForm />}
          {page === "suggestion" && <SuggestionPage analyses={analyses} />}
          {page === "secret" && <SecretPage />}
        </main>

        {/* Footer */}
        <footer className="mt-auto bg-white border-t p-4 text-center">
          <p className="text-gray-700 text-sm">
            Site créé par{" "}
            <a
              href="https://www.linkedin.com/in/gavuli/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Dr. Mohammad Panahandeh
            </a>
          </p>
        </footer>
      </div>
    </GoogleReCaptchaProvider>
  );
}

export default App;
