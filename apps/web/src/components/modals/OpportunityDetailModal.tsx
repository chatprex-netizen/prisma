import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Phone, Video, MapPin, FileSignature, MessageSquare, History, AlignLeft, CheckCircle2, User, DollarSign, Building } from 'lucide-react';
import { getProperties, createContract, updateOpportunityStage } from '../../lib/api';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any; // We'll pass the whole opportunity object
}

type TabType = 'TAREAS' | 'NOTAS' | 'HISTORIAL' | 'CONTRATO';

const TASK_TYPES = [
  { id: 'LLAMADA', label: 'Llamada', icon: Phone },
  { id: 'VISITA', label: 'Visita a Proyecto', icon: MapPin },
  { id: 'FIRMA', label: 'Firma de Contrato', icon: FileSignature },
  { id: 'OFICINA', label: 'Cita en Oficina', icon: User },
  { id: 'VIRTUAL', label: 'Reunión Virtual', icon: Video },
  { id: 'WHATSAPP', label: 'Seguimiento WP', icon: MessageSquare },
];

export function OpportunityDetailModal({ isOpen, onClose, opportunity }: OpportunityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('TAREAS');
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedDevId, setSelectedDevId] = useState('');
  const [selectedProjId, setSelectedProjId] = useState('');
  const [contractData, setContractData] = useState({
    propertyId: '',
    type: 'COMPRAVENTA',
    status: 'FIRMADO',
    amount: '',
    currency: 'USD',
    notes: ''
  });
  const [submittingContract, setSubmittingContract] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'CONTRATO') {
      getProperties().then(res => setProperties(res.data || [])).catch(console.error);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (opportunity) {
      setContractData({
        propertyId: '',
        type: 'COMPRAVENTA',
        status: 'FIRMADO',
        amount: String(opportunity.value || opportunity.contact?.budgetMin || ''),
        currency: opportunity.contact?.currency || 'USD',
        notes: ''
      });
      setSelectedDevId('');
      setSelectedProjId('');
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{opportunity.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="font-semibold text-brand-green">S/ {Number(opportunity.value || 0).toLocaleString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {opportunity.contact?.firstName} {opportunity.contact?.lastName}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-slate-200 rounded-md text-[11px] font-medium text-slate-700">
                Etapa: {opportunity.stage}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 flex flex-col shrink-0 p-3 space-y-1">
            <button
              onClick={() => setActiveTab('TAREAS')}
              className={`flex items-center gap-2 px-3 py-1.5.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'TAREAS' ? 'bg-brand-green/10 text-brand-green' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Calendar className="w-4 h-4" />
              Tareas y Citas
            </button>
            <button
              onClick={() => setActiveTab('NOTAS')}
              className={`flex items-center gap-2 px-3 py-1.5.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'NOTAS' ? 'bg-brand-green/10 text-brand-green' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <AlignLeft className="w-4 h-4" />
              Notas Libres
            </button>
            <button
              onClick={() => setActiveTab('HISTORIAL')}
              className={`flex items-center gap-2 px-3 py-1.5.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'HISTORIAL' ? 'bg-brand-green/10 text-brand-green' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <History className="w-4 h-4" />
              Historial
            </button>
            <button
              onClick={() => setActiveTab('CONTRATO')}
              className={`flex items-center gap-2 px-3 py-1.5.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'CONTRATO' ? 'bg-brand-green/10 text-brand-green' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FileSignature className="w-4 h-4" />
              Registrar Contrato
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6">
            
            {/* TAB: TAREAS Y CITAS */}
            {activeTab === 'TAREAS' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Programar Actividad</h3>
                
                {/* Formulario */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {TASK_TYPES.map((type) => (
                      <label key={type.id} className="relative cursor-pointer">
                        <input type="radio" name="taskType" value={type.id} className="peer sr-only" defaultChecked={type.id === 'LLAMADA'} />
                        <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 peer-checked:border-brand-green peer-checked:bg-brand-green/10 peer-checked:text-brand-green transition-all">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700">Fecha *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="date" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700">Hora *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="time" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <label className="block text-[11px] font-medium text-slate-700">Detalles de la tarea</label>
                    <textarea 
                      placeholder="Ej. Revisar el contrato de compraventa y explicar facilidades de pago."
                      className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 resize-none h-20"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-brand-green hover:bg-brand-greenHover text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                      Guardar Tarea
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-4">Próximas Actividades</h3>
                
                {/* Lista mock de tareas */}
                <div className="space-y-3">
                  <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-start gap-4 shadow-sm hover:border-brand-green/50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-900">Visita al Piloto</h4>
                        <span className="text-xs font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">Mañana, 10:00 AM</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Mostrar el dpto modelo de 2 habitaciones. Llevar brochure impreso.</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-green hover:border-brand-green hover:bg-brand-green/5 transition-all">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-start gap-4 shadow-sm hover:border-brand-green/50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-900">Llamada de seguimiento</h4>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Viernes, 4:30 PM</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Preguntar si logró conseguir la pre-aprobación del crédito hipotecario.</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-green hover:border-brand-green hover:bg-brand-green/5 transition-all">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: NOTAS */}
            {activeTab === 'NOTAS' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl h-full flex flex-col">
                <div className="mb-6 shrink-0">
                  <textarea 
                    placeholder="Escribe una nota importante sobre el cliente o la negociación..."
                    className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 resize-none h-32 shadow-sm mb-3 bg-yellow-50/30"
                  />
                  <div className="flex justify-end">
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                      Añadir Nota
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  <h3 className="text-base font-semibold text-slate-900 sticky top-0 bg-white py-2 z-10">Notas Anteriores</h3>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl relative">
                    <p className="text-sm text-slate-800">El cliente está muy interesado pero tiene que consultar la compra con su esposa el fin de semana. No presionarlo hasta el Lunes.</p>
                    <span className="text-xs text-slate-400 mt-2 block">12 de Octubre, 2:15 PM por Asesor Venta</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                    <p className="text-sm text-slate-800">Cliente ingresó por pauta de Facebook Ads de la campaña 'Octubre Mes Morado'. Busca algo menor a $100k.</p>
                    <span className="text-xs text-slate-400 mt-2 block">10 de Octubre, 9:00 AM por Asistente IA</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HISTORIAL */}
            {activeTab === 'HISTORIAL' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Registro de Actividad</h3>
                
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                  
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-green ring-4 ring-white"></div>
                    <p className="text-sm font-semibold text-slate-900">Etapa cambiada a 'Visita'</p>
                    <p className="text-xs text-slate-500 mt-0.5">Movido desde 'Calificación' por Juan Asesor</p>
                    <span className="text-xs text-slate-400 block mt-1">Hoy, 10:45 AM</span>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                    <p className="text-sm font-semibold text-slate-900">Tarea completada: 'Llamada inicial'</p>
                    <p className="text-xs text-slate-500 mt-0.5">Se logró contactar al cliente con éxito.</p>
                    <span className="text-xs text-slate-400 block mt-1">Ayer, 3:30 PM</span>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                    <p className="text-sm font-semibold text-slate-900">Oportunidad Creada</p>
                    <p className="text-xs text-slate-500 mt-0.5">Creado automáticamente por Asistente IA desde WhatsApp</p>
                    <span className="text-xs text-slate-400 block mt-1">10 de Octubre, 9:15 AM</span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
