const fs = require('fs');
const file = 'c:/prex/propify-crm/apps/web/src/pages/Contacts.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add helpers
const helpers = `
  const truncate = (str, max) => str && str.length > max ? str.substring(0, max) + '...' : (str || '');
  const getSourceColor = (source) => {
    switch ((source || '').toUpperCase()) {
      case 'WHATSAPP': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'FACEBOOK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'INSTAGRAM': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'REFERIDO': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PORTAL': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  const getStageColor = (stage) => {
    switch ((stage || '').toUpperCase()) {
      case 'PROSPECCION': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CALIFICACION': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PROPUESTA': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'NEGOCIACION': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CIERRE_GANADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CIERRE_PERDIDO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
`;

content = content.replace('return (', helpers + '\n  return (');

// Change onClick to onDoubleClick
content = content.replace('onClick={() => openDetail(contact)}', 'onDoubleClick={() => openDetail(contact)}');

// Truncate name
content = content.replace("{contact.firstName} {contact.lastName || ''}", "{truncate(`${contact.firstName || ''} ${contact.lastName || ''}`, 15)}");

// Adjust table header for mobile and add Asesor
content = content.replace(
  '<th className="px-2 py-2.5 sm:px-4 sm:py-3 hidden md:table-cell">Estado / Etapa</th>',
  '<th className="px-1 py-1 sm:px-4 sm:py-3">Estado / Etapa</th>\n                  <th className="px-1 py-1 sm:px-4 sm:py-3">Asesor</th>'
);

// Source color
content = content.replace(
  '<span className="text-[10px] text-brand-green font-normal tracking-wide px-2 py-0.5 rounded bg-brand-green/10 border border-brand-green/20">',
  '<span className={`text-[10px] font-medium tracking-wide px-2 py-0.5 rounded border ${getSourceColor(contact.source)}`}>'
);

// Stage and Asesor body
const oldTd = `<td className="px-2 py-2.5 sm:px-4 sm:py-3 hidden md:table-cell">
                      {contact.opportunities?.[0]?.stage ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200 uppercase">
                          {contact.opportunities[0].stage.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Sin op.</span>
                      )}
                    </td>`;

const newTd = `<td className="px-1 py-1 sm:px-4 sm:py-3 text-[9px] sm:text-xs">
                      {contact.opportunities?.[0]?.stage ? (
                        <span className={\`font-medium px-2 py-0.5 rounded-full border \${getStageColor(contact.opportunities[0].stage)}\`}>
                          {contact.opportunities[0].stage.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Sin op.</span>
                      )}
                    </td>
                    <td className="px-1 py-1 sm:px-4 sm:py-3 text-[9px] sm:text-xs">
                      {(() => {
                        const assignedUser = users.find(u => u.id === (contact.assignedTo || contact.assignedUserId));
                        const asesorName = assignedUser ? \`\${assignedUser.firstName} \${assignedUser.lastName || ''}\` : 'Sin asignar';
                        return (
                          <span className="truncate max-w-[70px] inline-block" title={asesorName}>
                            {truncate(asesorName, 10)}
                          </span>
                        );
                      })()}
                    </td>`;

content = content.replace(oldTd, newTd);

// Mobile font adjust
content = content.replace('<table className="w-full text-left text-[11px] sm:text-sm whitespace-nowrap">', '<table className="w-full text-left text-[9px] sm:text-sm whitespace-nowrap">');

fs.writeFileSync(file, content, 'utf8');
console.log('done modifying Contacts.tsx');
