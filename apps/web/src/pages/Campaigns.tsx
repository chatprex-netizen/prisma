import { useState, useEffect } from 'react';
import { Megaphone, FileText, Users, Edit3, Send, ArrowLeft, ArrowRight, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getCampaigns, getTemplates, seedTemplates, getContacts, createCampaign, sendCampaign } from '../lib/api';

const STEPS = [
  { id: 1, label: 'Plantilla', icon: FileText },
  { id: 2, label: 'Audiencia', icon: Users },
  { id: 3, label: 'Resumen', icon: Edit3 },
  { id: 4, label: 'Enviar', icon: Send },
];

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, tempRes, contRes] = await Promise.all([
        getCampaigns().catch(() => ({ data: [] })),
        getTemplates().catch(() => ({ data: [] })),
        getContacts().catch(() => ({ data: [] })),
      ]);

      setCampaigns(campRes.data || []);
      setTemplates(tempRes.data || []);
      setContacts(contRes.data || []);
    } catch (err) {
      console.error('Error fetching data for campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedTemplates = async () => {
    try {
      setLoading(true);
      await seedTemplates();
      await fetchData();
    } catch (err) {
      alert('Error al poblar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllContacts = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map(c => c.id));
    }
  };

  const handleToggleContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(prev => prev.filter(cId => cId !== id));
    } else {
      setSelectedContactIds(prev => [...prev, id]);
    }
  };

  const handleCreateAndSend = async () => {
    if (!window.confirm('¿Estás seguro de lanzar esta campaña de transmisión por WhatsApp?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. Create campaign
      const newCamp = await createCampaign({
        name: campaignName || 'Difusión WhatsApp',
        templateId: selectedTemplateId,
        contactIds: selectedContactIds,
      });

      // 2. Dispatch/Send campaign
      await sendCampaign(newCamp.data.id);

      alert('¡Campaña iniciada y despachada con éxito!');
      setIsCreating(false);
      setCampaignName('');
      setSelectedTemplateId('');
      setSelectedContactIds([]);
      setCurrentStep(1);
      fetchData();
    } catch (err: any) {
      alert('Error al enviar campaña: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Campaigns Dashboard (List View)
  if (!isCreating) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Campañas y Transmisiones</h1>
            <p className="text-xs text-slate-500 mt-0.5">Envía mensajes masivos y gestiona tus difusiones por WhatsApp</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-brand-green hover:bg-brand-greenHover text-white p-2 md:px-4 md:py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Nueva Transmisión</span>
          </button>
        </div>

        {/* Content Table / List */}
        {loading ? (
          <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-12 text-slate-500">
            Cargando campañas...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No hay campañas recientes</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Comienza a conectar con tus clientes enviando tu primera transmisión masiva por WhatsApp.
            </p>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800"
            >
              Crear mi primera campaña
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Plantilla</th>
                  <th className="px-6 py-4">Destinatarios</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{camp.name}</td>
                    <td className="px-6 py-4 text-slate-600">{camp.template?.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{camp.recipients?.length || 0} contactos</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        camp.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        camp.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                        camp.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Selected Template Object
  const currentTemplate = templates.find(t => t.id === selectedTemplateId);

  // Wizard Creation View
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full flex flex-col animate-fade-in">
      {/* Wizard Header */}
      <div className="mb-8">
        <button 
          onClick={() => setIsCreating(false)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Campañas
        </button>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight tracking-tight">Nueva transmisión</h1>
        <p className="text-sm text-slate-500 mt-1">Crea y envía un mensaje de difusión a tus contactos.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-12 shrink-0">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-slate-200 -z-10"></div>
        
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-brand-bg px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 border-2
                  ${isActive 
                    ? 'border-brand-green bg-brand-green text-white shadow-md shadow-brand-green/20' 
                    : isCompleted 
                      ? 'border-brand-green bg-white text-brand-green' 
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
              >
                {step.id}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-brand-green' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        
        {/* STEP 1: PLANTILLA */}
        {currentStep === 1 && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Elija una plantilla aprobada</h2>
                <p className="text-sm text-slate-500 mt-0.5">Seleccione la plantilla aprobada por Meta para su transmisión.</p>
              </div>
              {templates.length === 0 && (
                <button
                  onClick={handleSeedTemplates}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cargar Plantillas Demo
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-medium text-brand-green mb-1">Nombre de la campaña</label>
              <input type="text" placeholder="Ej. Promoción Lanzamiento Agosto" value={campaignName} onChange={(e) => setCampaignName(e.target.value)}
                className="w-full max-w-md px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
            
            {templates.length === 0 ? (
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No hay plantillas disponibles</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Haz clic en el botón para cargar plantillas de prueba aprobadas por defecto.
                </p>
                <button
                  onClick={handleSeedTemplates}
                  className="bg-brand-green hover:bg-brand-greenHover text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cargar Plantillas de Prueba
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'border-brand-green bg-brand-green/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 text-sm">{tpl.name}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                        {tpl.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Idioma: {tpl.language} | Categoría: {tpl.category}</p>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 border border-slate-100">
                      {tpl.components?.find((c: any) => c.type === 'BODY')?.text || 'Sin cuerpo de texto'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: AUDIENCIA */}
        {currentStep === 2 && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Seleccionar Destinatarios</h2>
                <p className="text-sm text-slate-500 mt-0.5">Elige los contactos que recibirán la transmisión por WhatsApp.</p>
              </div>
              <button
                onClick={handleSelectAllContacts}
                className="text-xs font-medium text-brand-green hover:underline"
              >
                {selectedContactIds.length === contacts.length ? 'Desmarcar todos' : 'Seleccionar todos'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 overflow-y-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {contacts.map((contact) => {
                    const isSelected = selectedContactIds.includes(contact.id);
                    return (
                      <tr
                        key={contact.id}
                        onClick={() => handleToggleContact(contact.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-brand-green/5' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={isSelected} onChange={() => {}}
                            className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {contact.firstName} {contact.lastName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{contact.phone}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{contact.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right text-xs text-slate-500">
              {selectedContactIds.length} de {contacts.length} contactos seleccionados
            </div>
          </div>
        )}

        {/* STEP 3: RESUMEN */}
        {currentStep === 3 && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900">Resumen de la Transmisión</h2>
            <p className="text-sm text-slate-500 mt-0.5 mb-6">Confirma los detalles antes de enviar.</p>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3.5 shadow-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-500">Nombre de Campaña:</span>
                <span className="text-sm font-bold text-slate-900">{campaignName || 'Difusión sin nombre'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-500">Plantilla Elegida:</span>
                <span className="text-sm font-bold text-brand-green">{currentTemplate?.name || 'Ninguna'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-500">Destinatarios Seleccionados:</span>
                <span className="text-sm font-bold text-slate-900">{selectedContactIds.length} contactos</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ENVIAR */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-8">
            <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">¡Todo listo para despachar!</h2>
            <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
              Al confirmar, la plantilla <span className="font-semibold">{currentTemplate?.name}</span> se enviará a los <span className="font-semibold">{selectedContactIds.length}</span> contactos seleccionados vía WhatsApp.
            </p>

            <button
              onClick={handleCreateAndSend}
              disabled={isSubmitting}
              className="bg-brand-green hover:bg-brand-greenHover text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-green/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando transmisión...' : 'Confirmar y Enviar Difusión'}
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {currentStep < 4 && (
        <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${currentStep === 1 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
          >
            Atrás
          </button>
          <button 
            onClick={() => {
              if (currentStep === 1 && !selectedTemplateId) {
                alert('Por favor selecciona una plantilla');
                return;
              }
              if (currentStep === 2 && selectedContactIds.length === 0) {
                alert('Por favor selecciona al menos un contacto');
                return;
              }
              setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
            }}
            className="bg-brand-green hover:bg-brand-greenHover text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
