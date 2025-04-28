import { Analysis } from './types';
export const AnalysisDetail = ({ analysis }: { analysis: Analysis }) => {
  return (
    <div className="space-y-4">
      {/* ...existing fields... */}
      {analysis.sector && (
        <div>
          <dt className="font-semibold">Secteur</dt>
          <dd>{analysis.sector}</dd>
        </div>
      )}
      {analysis.form && (
        <div>
          <dt className="font-semibold">Formulaire</dt>
          <dd>{analysis.form}</dd>
        </div>
      )}
      {/* ...existing fields... */}
    </div>
  );
};