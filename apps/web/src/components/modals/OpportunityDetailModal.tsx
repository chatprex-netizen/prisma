import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Phone, Video, MapPin, FileSignature, MessageSquare, History, AlignLeft, CheckCircle2, User, DollarSign, Building, Edit3 } from 'lucide-react';
import { getProperties, createContract, updateOpportunityStage, getAppointments, createAppointment, updateAppointment, updateContact } from '../../lib/api';
import { NewContactModal } from './NewContactModal';

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
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedDevId, setSelectedDevId] = useState('');
  const [selectedProjId, setSelectedProjId] = useState('');
  
  // New States for dynamic tasks/appointments and notes
  const [taskType, setTaskType] = useState('LLAMADA');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  
  const [newNote, setNewNote] = useState('');
  const [notesText, setNotesText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [contractData, setContractData] = useState({
    propertyId: '',
    type: 'COMPRAVENTA',
    status: 'FIRMADO',
    amount: '',
    currency: 'USD',
    notes: ''
  });
  const [submittingContract, setSubmittingContract] = useState(false);

  const fetchAppointments = async () => {
    if (!opportunity?.contactId) return;
    try {
      setLoadingAppts(true);
      const res = await getAppointments();
      const contactAppts = (res?.data || []).filter((a: any) => a.contactId === opportunity.contactId);
      setAppointments(contactAppts);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'CONTRATO') {
      getProperties().then(res => setProperties(res.data || [])).catch(console.error);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen && opportunity) {
      fetchAppointments();
      setNotesText(opportunity.contact?.notes || '');
      setTaskType('LLAMADA');
      setTaskDate('');
      setTaskTime('');
      setTaskDetails('');
      setNewNote('');
    }
  }, [isOpen, opportunity]);

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

  const contactName = opportunity.contact?.firstName 
    ? `${opportunity.contact.firstName} ${opportunity.contact.lastName || ''}`.trim()
    : 'Sin Contacto';

  // Helper to parse notes history
  const parseNotes = (text: string) => {
    if (!text) return [];
    return text.split('\n\n').filter(Boolean).map(block => {
      const lines = block.split('\n');
      const header = lines[0] || '';
      const content = lines.slice(1).join('\n') || '';
      const displayHeader = header.replace(/^\[|\]$/g, '');
      return { header: displayHeader, content };
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !opportunity.contactId) return;
    setSavingNote(true);
    try {
      const now = new Date();
      const dateStr = now.toLocaleString('es-PE', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const noteHeader = `[Nota del ${dateStr}]`;
      const formattedNote = `${noteHeader}\n${newNote.trim()}\n\n`;
      const updatedNotes = formattedNote + notesText;
      
      await updateContact(opportunity.contactId, { notes: updatedNotes });
      setNotesText(updatedNotes);
      setNewNote('');
      if (opportunity.contact) {
        opportunity.contact.notes = updatedNotes;
      }
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Error al guardar la nota');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveTask = async () => {
    if (!taskDate || !taskTime) {
      alert('Por favor selecciona la fecha y hora de la actividad.');
      return;
    }
    setSavingTask(true);
    try {
      let mappedType = 'LLAMADA';
      let typeLabel = 'Llamada';
      if (taskType === 'VISITA') {
        mappedType = 'VISITA_PROYECTO';
        typeLabel = 'Visita a Proyecto';
      } else if (taskType === 'FIRMA') {
        mappedType = 'PRESENTACION';
        typeLabel = 'Firma de Contrato';
      } else if (taskType === 'OFICINA') {
        mappedType = 'REUNION';
        typeLabel = 'Cita en Oficina';
      } else if (taskType === 'VIRTUAL') {
        mappedType = 'REUNION';
        typeLabel = 'Reunión Virtual';
      } else if (taskType === 'WHATSAPP') {
        mappedType = 'LLAMADA';
        typeLabel = 'Seguimiento WhatsApp';
      }

      const startDateTimeStr = `${taskDate}T${taskTime}`;
      const startAt = new Date(startDateTimeStr);
      const endAt = new Date(startAt.getTime() + 30 * 60 * 1000); // 30 mins duration

      await createAppointment({
        type: mappedType,
        title: `${typeLabel} - ${contactName}`,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        notes: taskDetails || '',
        contactId: opportunity.contactId,
        projectId: opportunity.projectId || null,
        propertyId: opportunity.propertyId || null,
        agentId: opportunity.agentId || opportunity.contact?.assignedTo || 'agent-id'
      });

      await fetchAppointments();
      setTaskDate('');
      setTaskTime('');
      setTaskDetails('');
      alert('¡Actividad programada con éxito!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al programar la actividad');
    } finally {
      setSavingTask(false);
    }
  };

  const handleCompleteAppointment = async (apptId: string) => {
    try {
      await updateAppointment(apptId, { status: 'COMPLETADA' });
      await fetchAppointments();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al completar la actividad');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-3xl h-[85vh] md:h-[72vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-955 truncate max-w-[50vw]">{opportunity.title}</h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xxs text-slate-500 font-semibold">
              <span className="flex items-center gap-0.5 truncate">
                <User className="w-3 h-3 text-slate-400" />
                {contactName}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[9px] font-medium text-slate-700 shrink-0">
                Etapa: {opportunity.stage}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
 
         <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
           {/* Sidebar / Topbar Tabs */}
           <div className="w-full md:w-44 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col shrink-0 p-2 md:p-3.5 gap-1.5 md:space-y-2.5 overflow-x-auto md:overflow-x-visible custom-scrollbar items-center md:items-stretch">
             <button
               onClick={() => setActiveTab('TAREAS')}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xxs font-bold transition-all shrink-0 ${activeTab === 'TAREAS' ? 'bg-brand-green/10 text-brand-green font-extrabold' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               <Calendar className="w-3.5 h-3.5" />
               Tareas y Citas
             </button>
             <button
               onClick={() => setActiveTab('NOTAS')}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xxs font-bold transition-all shrink-0 ${activeTab === 'NOTAS' ? 'bg-brand-green/10 text-brand-green font-extrabold' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               <AlignLeft className="w-3.5 h-3.5" />
               Notas Libres
             </button>
             <button
               onClick={() => setActiveTab('HISTORIAL')}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xxs font-bold transition-all shrink-0 ${activeTab === 'HISTORIAL' ? 'bg-brand-green/10 text-brand-green font-extrabold' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               <History className="w-3.5 h-3.5" />
               Historial
             </button>
             <button
               onClick={() => setActiveTab('CONTRATO')}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xxs font-bold transition-all shrink-0 ${activeTab === 'CONTRATO' ? 'bg-brand-green/10 text-brand-green font-extrabold' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               <FileSignature className="w-3.5 h-3.5" />
               Registrar Contrato
             </button>
 
             <div className="md:pt-2 md:mt-auto md:border-t border-slate-200/60 shrink-0">
               <button
                 type="button"
                 onClick={() => setIsEditContactOpen(true)}
                 className="flex md:w-full items-center justify-center gap-1.5 py-2 px-3 bg-brand-green hover:bg-brand-greenHover text-white rounded-lg text-xxs font-bold transition-all shadow-xs shadow-brand-green/20 shrink-0"
               >
                 <Edit3 className="w-3.5 h-3.5" />
                 Editar Contacto
               </button>
             </div>
           </div>
 
           {/* Main Content Area */}
           <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-5">
             
             {/* TAB: TAREAS Y CITAS */}
             {activeTab === 'TAREAS' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl text-left">
                 <h3 className="text-xs font-bold text-slate-900 mb-2.5">Programar Actividad</h3>
                 
                 {/* Formulario */}
                 <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs mb-5">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                     {TASK_TYPES.map((type) => (
                       <label key={type.id} className="relative cursor-pointer">
                         <input 
                           type="radio" 
                           name="taskType" 
                           value={type.id} 
                           className="peer sr-only" 
                           checked={taskType === type.id}
                           onChange={() => setTaskType(type.id)}
                         />
                         <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xxs font-bold text-slate-600 hover:bg-slate-50 peer-checked:border-brand-green peer-checked:bg-brand-green/10 peer-checked:text-brand-green transition-all">
                           <type.icon className="w-3.5 h-3.5 shrink-0" />
                           {type.label}
                         </div>
                       </label>
                     ))}
                   </div>
 
                   <div className="grid grid-cols-2 gap-3 mb-3">
                     <div className="space-y-0.5">
                       <label className="block text-[10px] font-bold text-slate-700">Fecha *</label>
                       <div className="relative">
                         <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                         <input 
                           type="date" 
                           value={taskDate}
                           onChange={e => setTaskDate(e.target.value)}
                           className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xxs focus:outline-none focus:ring-2 focus:ring-brand-green/15 bg-white font-semibold" 
                         />
                       </div>
                     </div>
                     <div className="space-y-0.5">
                       <label className="block text-[10px] font-bold text-slate-700">Hora *</label>
                       <div className="relative">
                         <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                         <input 
                           type="time" 
                           value={taskTime}
                           onChange={e => setTaskTime(e.target.value)}
                           className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xxs focus:outline-none focus:ring-2 focus:ring-brand-green/15 bg-white font-semibold" 
                         />
                       </div>
                     </div>
                   </div>
 
                   <div className="space-y-0.5 mb-3">
                     <label className="block text-[10px] font-bold text-slate-700">Detalles de la tarea</label>
                     <textarea 
                       value={taskDetails}
                       onChange={e => setTaskDetails(e.target.value)}
                       placeholder="Ej. Revisar el contrato de compraventa y explicar facilidades de pago."
                       className="w-full p-2.5 rounded-lg border border-slate-200 text-xxs focus:outline-none focus:ring-2 focus:ring-brand-green/15 resize-none h-14 bg-white"
                     />
                   </div>
 
                   <div className="flex justify-end">
                     <button 
                       onClick={handleSaveTask}
                       disabled={savingTask}
                       className="bg-brand-green hover:bg-brand-greenHover text-white px-4 py-1.5 rounded-lg text-xxs font-bold shadow-xs transition-colors disabled:opacity-50"
                     >
                       {savingTask ? 'Guardando...' : 'Guardar Tarea'}
                     </button>
                   </div>
                 </div>
 
                 <h3 className="text-xs font-bold text-slate-900 mb-2.5">Próximas Actividades</h3>
                 
                 {/* Lista real de tareas */}
                 <div className="space-y-2">
                   {loadingAppts ? (
                     <div className="text-center py-4">
                       <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
                     </div>
                   ) : appointments.length === 0 ? (
                     <p className="text-xxs text-slate-400 text-center py-4">No hay tareas o citas programadas.</p>
                   ) : (
                     appointments.map((appt) => {
                       const isCompleted = appt.status === 'COMPLETADA';
                       const formattedDate = new Date(appt.startAt).toLocaleString('es-PE', {
                         day: 'numeric',
                         month: 'short',
                         hour: '2-digit',
                         minute: '2-digit'
                       });
                       
                       let Icon = Calendar;
                       if (appt.type === 'LLAMADA') Icon = Phone;
                       else if (appt.type === 'VISITA_PROYECTO' || appt.type === 'VISITA_UNIDAD') Icon = MapPin;
                       else if (appt.type === 'PRESENTACION') Icon = FileSignature;
                       else if (appt.type === 'REUNION') Icon = User;
 
                       return (
                         <div key={appt.id} className={`p-3 border rounded-xl bg-white flex items-start gap-3 shadow-xs transition-colors ${isCompleted ? 'border-slate-100 opacity-60' : 'border-slate-200/80 hover:border-brand-green/30'}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-slate-100 text-slate-400' : 'bg-brand-green/10 text-brand-green'}`}>
                             <Icon className="w-4 h-4" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start">
                               <h4 className={`text-xs font-bold text-slate-900 truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>{appt.title}</h4>
                               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${isCompleted ? 'bg-slate-100 text-slate-400' : 'text-brand-green bg-brand-green/10'}`}>
                                 {formattedDate}
                               </span>
                             </div>
                             <p className={`text-xxs text-slate-500 mt-0.5 leading-relaxed truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>{appt.notes || 'Sin detalles.'}</p>
                           </div>
                           {!isCompleted ? (
                             <button 
                               onClick={() => handleCompleteAppointment(appt.id)}
                               className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-green hover:border-brand-green hover:bg-brand-green/5 transition-all shrink-0"
                               title="Marcar como completada"
                             >
                               <CheckCircle2 className="w-4 h-4" />
                             </button>
                           ) : (
                             <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                           )}
                         </div>
                       );
                     })
                   )}
                 </div>
 
               </div>
             )}
 
             {/* TAB: NOTAS */}
             {activeTab === 'NOTAS' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl h-full flex flex-col text-left">
                 <div className="mb-4 shrink-0">
                   <textarea 
                     value={newNote}
                     onChange={e => setNewNote(e.target.value)}
                     placeholder="Escribe una nota importante sobre el cliente o la negociación..."
                     className="w-full p-3 rounded-xl border border-slate-200 text-xxs focus:outline-none focus:ring-2 focus:ring-brand-green/15 resize-none h-20 shadow-xs mb-2 bg-yellow-50/15"
                   />
                   <div className="flex justify-end">
                     <button 
                       onClick={handleAddNote}
                       disabled={savingNote}
                       className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xxs font-bold shadow-xs transition-colors disabled:opacity-50"
                     >
                       {savingNote ? 'Añadiendo...' : 'Añadir Nota'}
                     </button>
                   </div>
                 </div>
 
                 <div className="space-y-2.5 flex-1 overflow-y-auto">
                   <h3 className="text-xs font-bold text-slate-900 sticky top-0 bg-white py-1 z-10">Notas Anteriores</h3>
                   
                   {parseNotes(notesText).length === 0 ? (
                     <p className="text-xxs text-slate-400 text-center py-4">No hay notas guardadas para este cliente.</p>
                   ) : (
                     parseNotes(notesText).map((note, idx) => (
                       <div key={idx} className="p-3 bg-yellow-50/60 border border-yellow-100 rounded-xl relative text-left">
                         <p className="text-xxs text-slate-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                         <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">{note.header}</span>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}
 
             {/* TAB: HISTORIAL */}
             {activeTab === 'HISTORIAL' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl text-left font-sans">
                 <h3 className="text-xs font-bold text-slate-900 mb-4">Registro de Actividad</h3>
                 
                 <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-3">
                   {(!opportunity.activities || opportunity.activities.length === 0) ? (
                     <div className="relative pl-5">
                       <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-brand-green ring-4 ring-white"></div>
                       <p className="text-xs font-bold text-slate-900">Oportunidad Creada</p>
                       <p className="text-xxs text-slate-500 mt-0.5">La oportunidad fue registrada en el sistema.</p>
                       <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">
                         {new Date(opportunity.createdAt).toLocaleString('es-PE')}
                       </span>
                     </div>
                   ) : (
                     opportunity.activities.map((act: any) => (
                       <div key={act.id} className="relative pl-5">
                         <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${act.type === 'CAMBIO_ETAPA' ? 'bg-brand-green' : act.type === 'CONTRATO_FIRMADO' || act.type === 'CONTRATO_CREADO' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                         <p className="text-xs font-bold text-slate-900">{act.description}</p>
                         <p className="text-xxs text-slate-500 mt-0.5">
                           Registrado por {act.user?.firstName} {act.user?.lastName || ''}
                         </p>
                         <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">
                           {new Date(act.createdAt).toLocaleString('es-PE')}
                         </span>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}

             {/* TAB: CONTRATO (REGISTRAR CIERRE / VENTA) */}
            {activeTab === 'CONTRATO' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-xl text-left">
                <h3 className="text-xs font-bold text-slate-900 mb-1">Registrar Venta / Firma de Contrato</h3>
                <p className="text-[10px] text-slate-500 mb-3">
                  Completa los datos de la unidad vendida para registrar el contrato y marcar esta oportunidad como <strong>CIERRE GANADO</strong> de forma automática.
                </p>

                {/* Form */}
                <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  {/* Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="block text-[9px] font-bold text-slate-700">Desarrollador</label>
                      <select
                        value={selectedDevId}
                        onChange={e => {
                          setSelectedDevId(e.target.value);
                          setSelectedProjId('');
                          setContractData(prev => ({ ...prev, propertyId: '' }));
                        }}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xxs bg-white font-semibold"
                      >
                        <option value="">Selecciona...</option>
                        {Array.from(new Map(properties.map(p => p.project?.developer).filter(Boolean).map(d => [d.id, d])).values()).map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-[9px] font-bold text-slate-700">Proyecto</label>
                      <select
                        value={selectedProjId}
                        onChange={e => {
                          setSelectedProjId(e.target.value);
                          setContractData(prev => ({ ...prev, propertyId: '' }));
                        }}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xxs bg-white font-semibold"
                      >
                        <option value="">Selecciona...</option>
                        {Array.from(new Map(properties.filter(p => !selectedDevId || p.project?.developerId === selectedDevId).map(p => p.project).filter(Boolean).map(pr => [pr.id, pr])).values()).map((pr: any) => (
                          <option key={pr.id} value={pr.id}>{pr.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-[9px] font-bold text-slate-700">Unidad/Propiedad *</label>
                      <select
                        value={contractData.propertyId}
                        onChange={e => setContractData(prev => ({ ...prev, propertyId: e.target.value }))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xxs bg-white font-bold"
                        required
                      >
                        <option value="">Selecciona Unidad...</option>
                        {properties
                          .filter(p => p.status === 'DISPONIBLE' && (!selectedProjId || p.projectId === selectedProjId) && (!selectedDevId || p.project?.developerId === selectedDevId))
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.unitCode} - {p.title || 'Sin Título'}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Price and Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="block text-[9px] font-bold text-slate-700">Tipo de Documento</label>
                      <select
                        value={contractData.type}
                        onChange={e => setContractData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xxs bg-white font-semibold"
                      >
                        <option value="COMPRAVENTA">Compraventa</option>
                        <option value="SEPARACION">Separación</option>
                        <option value="ALQUILER">Alquiler</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-[9px] font-bold text-slate-700">Precio Venta (Monto)</label>
                      <input
                        type="number"
                        value={contractData.amount}
                        onChange={e => setContractData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Monto"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xxs bg-white font-semibold"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-[9px] font-bold text-slate-700">Moneda</label>
                      <select
                        value={contractData.currency}
                        onChange={e => setContractData(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xxs bg-white font-semibold"
                      >
                        <option value="USD">Dólares ($)</option>
                        <option value="PEN">Soles (S/)</option>
                        <option value="EUR">Euros (€)</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-0.5">
                    <label className="block text-[9px] font-bold text-slate-700">Comentarios de Cierre</label>
                    <textarea
                      value={contractData.notes}
                      onChange={e => setContractData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Indica condiciones adicionales de la venta..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xxs bg-white resize-none h-12"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!contractData.propertyId) {
                          alert('Por favor selecciona la unidad vendida.');
                          return;
                        }
                        if (!contractData.amount) {
                          alert('Por favor indica el precio de venta.');
                          return;
                        }
                        try {
                          setSubmittingContract(true);
                          
                          // 1. Create the contract
                          await createContract({
                            buyerId: opportunity.contactId,
                            propertyId: contractData.propertyId,
                            type: contractData.type,
                            status: 'FIRMADO',
                            amount: contractData.amount,
                            currency: contractData.currency,
                            notes: contractData.notes,
                            agentId: opportunity.agentId || opportunity.contact?.assignedTo
                          });

                          // 2. Mark opportunity as CIERRE_GANADO
                          await updateOpportunityStage(opportunity.id, 'CIERRE_GANADO');

                          alert('🎉 ¡Venta registrada y contrato guardado con éxito!');
                          onClose();
                          window.location.reload(); // Quick refresh
                        } catch (err: any) {
                          alert(err.message || 'Error al registrar el contrato');
                        } finally {
                          setSubmittingContract(false);
                        }
                      }}
                      disabled={submittingContract}
                      className="bg-brand-green hover:bg-brand-greenHover text-white px-3 py-1.5 rounded-lg text-xxs font-bold transition-all flex items-center gap-1 shadow-xs shadow-brand-green/20"
                    >
                      {submittingContract ? 'Registrando...' : 'Confirmar Venta'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {isEditContactOpen && (
        <NewContactModal
          isOpen={isEditContactOpen}
          onClose={() => setIsEditContactOpen(false)}
          initialData={opportunity.contact}
          onSuccess={() => {
            setIsEditContactOpen(false);
            alert('¡Datos del contacto actualizados con éxito!');
            window.location.reload(); // Reload to reflect updates
          }}
        />
      )}
    </div>
  );
}
