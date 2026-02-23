"use client";

interface Props {
  warnings: string[];
  onDismiss: () => void;
}

export function PrivacyGuard({ warnings, onDismiss }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-orange-800 text-sm mb-2">
            Privacy waarschuwing – mogelijke persoonsgegevens gedetecteerd
          </p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-orange-700">
                ⚠ {w}
              </li>
            ))}
          </ul>
          <p className="text-xs text-orange-600 mt-2">
            Vervang namen door &quot;bewoner X&quot;, &quot;medewerker Y&quot; of vergelijkbare anonieme aanduidingen.
            Sla geen echte namen, kamernummers of geboortedatums op.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-orange-500 hover:text-orange-700 text-lg leading-none shrink-0"
          title="Sluiten"
        >
          ×
        </button>
      </div>
    </div>
  );
}
