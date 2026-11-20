const LABELS = {
  DESIGN: 'Design',
  REVIEW: 'Review',
  APPROVED: 'Approved',
  PRINTED: 'Printed',
};

function PhaseBadge({ phase }) {
  // La clase permitirá darle un color distinto a cada fase cuando tengas tu diseño
  return <span className={`badge badge-${phase.toLowerCase()}`}>{LABELS[phase] ?? phase}</span>;
}

export default PhaseBadge;