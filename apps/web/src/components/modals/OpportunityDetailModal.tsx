import { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Phone, Video, MapPin, FileSignature, 
  MessageSquare, History, AlignLeft, CheckCircle2, User, 
  DollarSign, Building, Edit3, ChevronRight, CheckSquare, Plus, Check, AlertCircle, AlertTriangle
} from 'lucide-react';
import { 
  getProperties, updateProperty, createContract, updateOpportunityStage, 
  getAppointments, createAppointment, updateAppointment, 
  updateContact, getUsers 
} from '../../lib/api';
import { NewContactModal } from './NewContactModal';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
}

export function OpportunityDetailModal({ isOpen, onClose, opportunity }: OpportunityDetailModalProps) {
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  
  // Pipeline Stage state
  const [currentStage, setCurrentStage] = useState('');

  // Sub-modal visibility states
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isCitaOpen, setIsCitaOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);

  // Timeline Filter state
  const [timelineFilter, setTimelineFilter] = useState<'TODOS' | 'TASK' | 'CITA' | 'NOTE' | 'COMM'>('TODOS');

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAgentId, setTaskAgentId] = useState('');
  const [taskPropId, setTaskPropId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIA');
  const [taskStatus, setTaskStatus] = useState('PENDIENTE');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Form states - Cita
  const [citaTitle, setCitaTitle] = useState('');
  const [citaPropId, setCitaPropId] = useState('');
  const [citaAgentId, setCitaAgentId] = useState('');
  const [citaDate, setCitaDate] = useState('');
  const [citaStartTime, setCitaStartTime] = useState('');
  const [citaEndTime, setCitaEndTime] = useState('');
  const [citaType, setCitaType] = useState('REUNION');
  const [citaLocation, setCitaLocation] = useState('');
  const [citaVideoLink, setCitaVideoLink] = useState('');
  const [citaDesc, setCitaDesc] = useState('');
  const [citaStatus, setCitaStatus] = useState('PENDIENTE');
  const [submittingCita, setSubmittingCita] = useState(false);

  // Form states - Note
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Form states - Call
  const [callTitle, setCallTitle] = useState('Llamada con cliente');
  const [callResult, setCallResult] = useState('CONTESTO');
  const [callDetails, setCallDetails] = useState('');
  const [submittingCall, setSubmittingCall] = useState(false);

  // Form states - Message
  const [msgChannel, setMsgChannel] = useState('WHATSAPP');
  const [msgDetails, setMsgDetails] = useState('');
  const [submittingMsg, setSubmittingMsg] = useState(false);

  // Form states - Contract
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
    if (isOpen && opportunity) {
      setCurrentStage(opportunity.stage || '');
      fetchAppointments();
      getProperties().then(res => setProperties(res.data || [])).catch(console.error);
      getUsers().then(res => setAgents(res.data || [])).catch(console.error);
      
      // Reset task values defaults
      setTaskAgentId(opportunity.agentId || opportunity.contact?.assignedTo || '');
      setCitaAgentId(opportunity.agentId || opportunity.contact?.assignedTo || '');
      setContractData({
        propertyId: '',
        type: 'COMPRAVENTA',
        status: 'FIRMADO',
        amount: String(opportunity.value || opportunity.contact?.budgetMin || ''),
        currency: opportunity.contact?.currency || 'USD',
        notes: ''
      });
    }
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const contactName = opportunity.contact?.firstName 
    ? `${opportunity.contact.firstName} ${opportunity.contact.lastName || ''}`.trim()
    : 'Sin Contacto';

  // Helper to parse notes history (legacy compatibility)
  const parseNotes = (text: string) => {
    if (!text) return [];
    return text.split('\n\n').filter(Boolean).map(block => {
      const lines = block.split('\n');
      const header = lines[0] || '';
      const content = lines.slice(1).join('\n') || '';
      const displayHeader = header.replace(/^\[|\]$/g, '');
      return { header: displayHeader, content, isLegacyNote: true };
    });
  };

  const handleStageChange = async (newStage: string) => {
    try {
      await updateOpportunityStage(opportunity.id, newStage);
      setCurrentStage(newStage);
      opportunity.stage = newStage; // local update
      await fetchAppointments(); // Refresh timeline as stage changes log activities
    } catch (err: any) {
      alert('Error al actualizar la etapa de la negociación: ' + (err.message || err));
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    setSubmittingTask(true);
    try {
      const dueDateTime = new Date(`${taskDueDate}T23:59:59`);
      const notesJson = JSON.stringify({
        isTask: true,
        description: taskDesc,
        priority: taskPriority
      });

      await createAppointment({
        type: 'PRESENTACION', // Internal mapping for task
        title: taskTitle,
        startAt: dueDateTime.toISOString(),
        endAt: dueDateTime.toISOString(),
        notes: notesJson,
        status: taskStatus,
        contactId: opportunity.contactId,
        propertyId: taskPropId || null,
        agentId: taskAgentId || opportunity.agentId
      });

      await fetchAppointments();
      setIsTaskOpen(false);
      // Reset
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskPriority('MEDIA');
      setTaskStatus('PENDIENTE');
    } catch (err: any) {
      alert(err.message || 'Error al guardar la tarea');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleSaveCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaTitle || !citaDate || !citaStartTime || !citaEndTime) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    setSubmittingCita(true);
    try {
      const startDateTime = new Date(`${citaDate}T${citaStartTime}`);
      const endDateTime = new Date(`${citaDate}T${citaEndTime}`);
      const notesJson = JSON.stringify({
        isTask: false,
        description: citaDesc,
        videoLink: citaVideoLink,
        reminderMinutes: 15
      });

      await createAppointment({
        type: citaType,
        title: citaTitle,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        notes: notesJson,
        status: citaStatus,
        location: citaLocation || null,
        contactId: opportunity.contactId,
        propertyId: citaPropId || null,
        agentId: citaAgentId || opportunity.agentId
      });

      await fetchAppointments();
      setIsCitaOpen(false);
      // Reset
      setCitaTitle('');
      setCitaDate('');
      setCitaStartTime('');
      setCitaEndTime('');
      setCitaLocation('');
      setCitaVideoLink('');
      setCitaDesc('');
    } catch (err: any) {
      alert(err.message || 'Error al agendar la cita');
    } finally {
      setSubmittingCita(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      // We save notes as legacy app notes on the contact
      const now = new Date();
      const dateStr = now.toLocaleString('es-PE', { 
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit' 
      });
      const noteHeader = `[Nota del ${dateStr}]`;
      const formattedNote = `${noteHeader}\n${noteContent.trim()}\n\n`;
      const updatedNotes = formattedNote + (opportunity.contact?.notes || '');
      
      await updateContact(opportunity.contactId, { notes: updatedNotes });
      if (opportunity.contact) {
        opportunity.contact.notes = updatedNotes;
      }
      
      // Also register as an appointment with isNote: true to display it dynamically
      const notesJson = JSON.stringify({
        isNote: true,
        description: noteContent.trim()
      });
      await createAppointment({
        type: 'REUNION',
        title: `Nota registrada`,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        notes: notesJson,
        status: 'COMPLETADA',
        contactId: opportunity.contactId,
        agentId: opportunity.agentId
      });

      await fetchAppointments();
      setNoteContent('');
      setIsNoteOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la nota');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSaveCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCall(true);
    try {
      const notesJson = JSON.stringify({
        isCall: true,
        result: callResult,
        description: callDetails
      });
      await createAppointment({
        type: 'LLAMADA',
        title: callTitle,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        notes: notesJson,
        status: 'COMPLETADA',
        contactId: opportunity.contactId,
        agentId: opportunity.agentId
      });

      await fetchAppointments();
      setIsCallOpen(false);
      setCallDetails('');
    } catch (err: any) {
      alert(err.message || 'Error al registrar la llamada');
    } finally {
      setSubmittingCall(false);
    }
  };

  const handleSaveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgDetails.trim()) return;
    setSubmittingMsg(true);
    try {
      const notesJson = JSON.stringify({
        isMessage: true,
        channel: msgChannel,
        description: msgDetails
      });
      await createAppointment({
        type: 'LLAMADA', // mapping to call/log
        title: `Mensaje por ${msgChannel}`,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        notes: notesJson,
        status: 'COMPLETADA',
        contactId: opportunity.contactId,
        agentId: opportunity.agentId
      });

      await fetchAppointments();
      setIsMessageOpen(false);
      setMsgDetails('');
    } catch (err: any) {
      alert(err.message || 'Error al guardar el mensaje');
    } finally {
      setSubmittingMsg(false);
    }
  };

  const handleCompleteAppt = async (apptId: string, type: 'TASK' | 'CITA') => {
    try {
      await updateAppointment(apptId, { status: 'COMPLETADA' });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Error al completar la actividad');
    }
  };

  // Compile timeline events
  const getTimelineEvents = () => {
    const events: any[] = [];

    // 1. Add appointments (which include tasks, citas, calls, messages, notes)
    appointments.forEach((appt) => {
      let meta: any = {};
      try {
        meta = JSON.parse(appt.notes || '{}');
      } catch {
        meta = { description: appt.notes || '' };
      }

      if (meta.isTask) {
        events.push({
          id: appt.id,
          type: 'TASK',
          title: appt.title,
          description: meta.description,
          date: new Date(appt.startAt),
          priority: meta.priority || 'MEDIA',
          status: appt.status,
          assignedTo: appt.agent,
          property: appt.property,
          raw: appt
        });
      } else if (meta.isNote) {
        events.push({
          id: appt.id,
          type: 'NOTE',
          title: appt.title,
          description: meta.description,
          date: new Date(appt.startAt),
          raw: appt
        });
      } else if (meta.isCall) {
        events.push({
          id: appt.id,
          type: 'CALL',
          title: appt.title,
          description: meta.description,
          result: meta.result,
          date: new Date(appt.startAt),
          raw: appt
        });
      } else if (meta.isMessage) {
        events.push({
          id: appt.id,
          type: 'MESSAGE',
          title: appt.title,
          description: meta.description,
          channel: meta.channel,
          date: new Date(appt.startAt),
          raw: appt
        });
      } else {
        // Normal Cita
        events.push({
          id: appt.id,
          type: 'CITA',
          title: appt.title,
          description: meta.description,
          date: new Date(appt.startAt),
          endDate: new Date(appt.endAt),
          location: appt.location,
          videoLink: meta.videoLink,
          status: appt.status,
          assignedTo: appt.agent,
          property: appt.property,
          appointmentType: appt.type,
          raw: appt
        });
      }
    });

    // 2. Add opportunity log activities
    if (opportunity.activities) {
      opportunity.activities.forEach((act: any) => {
        events.push({
          id: act.id,
          type: 'ACTIVITY_LOG',
          title: act.description,
          description: `Registrado por ${act.user?.firstName || 'Asesor'}`,
          date: new Date(act.createdAt),
          raw: act
        });
      });
    }

    // 3. Add legacy notes
    const legacy = parseNotes(opportunity.contact?.notes || '');
    legacy.forEach((note, index) => {
      // Find date
      let parsedDate = new Date(opportunity.createdAt);
      const dateMatch = note.header.match(/Nota del (.*)/);
      if (dateMatch && dateMatch[1]) {
        const parsed = Date.parse(dateMatch[1]);
        if (!isNaN(parsed)) parsedDate = new Date(parsed);
      }
      events.push({
        id: `legacy-${index}`,
        type: 'NOTE',
        title: 'Nota registrada (Anterior)',
        description: note.content,
        date: parsedDate,
        header: note.header
      });
    });

    // Sort newest first
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = getTimelineEvents();

  // Apply timeline filtering
  const filteredEvents = timelineEvents.filter((ev) => {
    if (timelineFilter === 'TODOS') return true;
    if (timelineFilter === 'TASK') return ev.type === 'TASK';
    if (timelineFilter === 'CITA') return ev.type === 'CITA';
    if (timelineFilter === 'NOTE') return ev.type === 'NOTE';
    if (timelineFilter === 'COMM') return ev.type === 'CALL' || ev.type === 'MESSAGE';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header (Top Panel) */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 text-left">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold text-slate-900 truncate max-w-[40vw]">{opportunity.title}</h2>
              
              {/* Interactive Stage Selector Dropdown */}
              <select value={currentStage} onChange={(e) => handleStageChange(e.target.value)}
                className="px-2 py-0.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-lg text-[10px] font-extrabold outline-none cursor-pointer hover:bg-brand-green/15 transition-all"
              >
                <option value="PROSPECTO">Prospecto</option>
                <option value="CONTACTADO">Contactado</option>
                <option value="CALIFICACION">Calificación</option>
                <option value="PROPUESTA">Propuesta</option>
                <option value="NEGOCIACION">Negociación</option>
                <option value="CIERRE_GANADO">Cierre Ganado</option>
                <option value="CIERRE_PERDIDO">Cierre Perdido</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {contactName}
              </span>
              <span>•</span>
              <span className="font-medium">{opportunity.contact?.phone || 'Sin Teléfono'}</span>
              <span>•</span>
              <span className="text-slate-400 break-all">{opportunity.contact?.email || 'Sin Email'}</span>
              <span>•</span>
              <button 
                onClick={() => setIsEditContactOpen(true)}
                className="text-brand-green hover:text-brand-greenHover font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <Edit3 className="w-3 h-3" />
                Editar Contacto
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-white p-5 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Quick Action Horizontal Toolbar */}
          <div className="bg-slate-50/60 border border-slate-200/50 p-4 rounded-2xl flex items-center justify-around flex-wrap gap-4 shrink-0 shadow-2xs">
            
            {/* Tareas */}
            <button 
              onClick={() => setIsTaskOpen(true)}
              className="flex flex-col items-center gap-1 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-600 group-hover:bg-blue-50 transition-all shadow-sm">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Tareas
              </span>
            </button>

            {/* Cita */}
            <button 
              onClick={() => setIsCitaOpen(true)}
              className="flex flex-col items-center gap-1 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-brand-green group-hover:border-brand-green group-hover:bg-brand-green/5 transition-all shadow-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Cita
              </span>
            </button>

            {/* Notas */}
            <button 
              onClick={() => setIsNoteOpen(true)}
              className="flex flex-col items-center gap-1 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-yellow-600 group-hover:border-yellow-600 group-hover:bg-yellow-50 transition-all shadow-sm">
                <AlignLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Notas
              </span>
            </button>

            {/* Llamar */}
            <button 
              onClick={() => setIsCallOpen(true)}
              className="flex flex-col items-center gap-1 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:border-purple-600 group-hover:bg-purple-50 transition-all shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Llamar
              </span>
            </button>



            {/* Cierre (Contrato) */}
            <button 
              onClick={() => setIsContractOpen(true)}
              className="flex flex-col items-center gap-1 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-600 group-hover:bg-emerald-50 transition-all shadow-sm">
                <FileSignature className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Cerrar Trato
              </span>
            </button>

          </div>

          {/* Unified Chronological Timeline (Historial de Actividades) */}
          <div className="flex-1 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2 gap-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Historial de Seguimiento
              </h3>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { id: 'TODOS', label: 'Todo' },
                  { id: 'TASK', label: 'Tareas' },
                  { id: 'CITA', label: 'Citas' },
                  { id: 'NOTE', label: 'Notas' },
                  { id: 'COMM', label: 'Comunicaciones' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setTimelineFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border transition-colors whitespace-nowrap ${
                      timelineFilter === f.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingAppts ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No se encontraron registros en este filtro de seguimiento.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-5">
                {filteredEvents.map((ev, idx) => {
                  let badgeColor = 'bg-slate-100 text-slate-600';
                  let bgTint = 'bg-white';
                  let borderCol = 'border-slate-200';
                  let Icon = History;
                  let isPending = false;

                  if (ev.type === 'TASK') {
                    Icon = CheckSquare;
                    badgeColor = 'bg-blue-15 text-blue-700';
                    bgTint = 'bg-blue-50/5';
                    borderCol = 'border-blue-100';
                    isPending = ev.status === 'PENDIENTE' || ev.status === 'EN_PROGRESO';
                  } else if (ev.type === 'CITA') {
                    Icon = Calendar;
                    badgeColor = 'bg-brand-green/10 text-brand-green';
                    bgTint = 'bg-brand-green/5';
                    borderCol = 'border-brand-green/10';
                    isPending = ev.status === 'PENDIENTE' || ev.status === 'CONFIRMADA';
                  } else if (ev.type === 'NOTE') {
                    Icon = AlignLeft;
                    badgeColor = 'bg-amber-100 text-amber-800';
                    bgTint = 'bg-amber-50/20';
                    borderCol = 'border-amber-100';
                  } else if (ev.type === 'CALL') {
                    Icon = Phone;
                    badgeColor = 'bg-purple-100 text-purple-700';
                    bgTint = 'bg-purple-50/10';
                    borderCol = 'border-purple-100';
                  } else if (ev.type === 'MESSAGE') {
                    Icon = MessageSquare;
                    badgeColor = 'bg-pink-100 text-pink-700';
                    bgTint = 'bg-pink-50/10';
                    borderCol = 'border-pink-100';
                  } else if (ev.type === 'ACTIVITY_LOG') {
                    Icon = History;
                  }

                  const dateStr = ev.date.toLocaleString('es-PE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  });

                  // Calculate if task/cita is overdue
                  const isOverdue = isPending && ev.date.getTime() < new Date().getTime();

                  return (
                    <div key={ev.id || idx} className="relative group">
                      
                      {/* Circle icon on the timeline line */}
                      <div className={`absolute -left-[35px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center border bg-white shadow-2xs group-hover:scale-105 transition-transform ${
                        ev.type === 'TASK' ? 'text-blue-600 border-blue-200' :
                        ev.type === 'CITA' ? 'text-brand-green border-brand-green/20' :
                        ev.type === 'NOTE' ? 'text-amber-600 border-amber-200' :
                        ev.type === 'CALL' ? 'text-purple-600 border-purple-200' :
                        ev.type === 'MESSAGE' ? 'text-pink-600 border-pink-200' :
                        'text-slate-400 border-slate-200'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Card Body */}
                      <div className={`p-4 border rounded-xl shadow-2xs transition-all hover:shadow-xs flex items-start gap-4 ${bgTint} ${borderCol} ${isOverdue ? 'border-red-200 bg-red-50/5' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-bold text-slate-900 ${ev.status === 'COMPLETADA' ? 'line-through text-slate-400' : ''}`}>
                                  {ev.title}
                                </h4>
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700 animate-pulse">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    ¡Atrasada!
                                  </span>
                                )}
                              </div>
                              {ev.type === 'TASK' && (
                                <div className="flex gap-2 items-center mt-1">
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                    Prioridad: {ev.priority}
                                  </span>
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    ev.status === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' :
                                    ev.status === 'CONFIRMADA' || ev.status === 'EN_PROGRESO' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {ev.status}
                                  </span>
                                </div>
                              )}
                              {ev.type === 'CITA' && (
                                <div className="flex gap-2 items-center mt-1">
                                  {ev.location && (
                                    <span className="text-[9px] font-semibold text-slate-500 flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {ev.location}
                                    </span>
                                  )}
                                  {ev.videoLink && (
                                    <a href={ev.videoLink} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-brand-green hover:underline flex items-center gap-0.5">
                                      <Video className="w-2.5 h-2.5" />
                                      Reunión
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                              {dateStr}
                            </span>
                          </div>
                          
                          {ev.description && (
                            <p className={`text-[11px] text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap ${ev.status === 'COMPLETADA' ? 'line-through text-slate-400' : ''}`}>
                              {ev.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons (Complete Task/Cita) */}
                        {isPending && (
                          <button
                            onClick={() => handleCompleteAppt(ev.id, ev.type)}
                            className="w-7 h-7 rounded-full border border-slate-200 hover:border-brand-green hover:border-brand-green hover:bg-brand-green/5 text-slate-400 hover:text-brand-green flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                            title="Marcar como completada"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                        )}
                        {!isPending && (ev.type === 'TASK' || ev.type === 'CITA') && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SUB-MODALS OVERLAYS */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      {/* 1. Modal: Nueva Tarea */}
      {isTaskOpen && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Registrar Nueva Tarea</h3>
              <button onClick={() => setIsTaskOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="p-4 space-y-3.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Título de la tarea *</label>
                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Ej: Llamar para confirmar visita" 
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white font-semibold"
                  required 
                />
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Detalles / notas</label>
                <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Instrucciones adicionales..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white resize-none h-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Responsable *</label>
                  <select value={taskAgentId} onChange={e => setTaskAgentId(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.firstName} {a.lastName || ''}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Propiedad relacionada</label>
                  <select value={taskPropId} onChange={e => setTaskPropId(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="">Ninguna</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.unitCode} - {p.project?.name || ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Fecha límite *</label>
                  <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                    required 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Prioridad</label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Estado</label>
                  <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTaskOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">
                  Cancelar
                </button>
                <button type="submit" disabled={submittingTask} className="px-4 py-1.5 bg-brand-green text-white text-xs rounded-lg font-bold shadow-xs">
                  {submittingTask ? 'Guardando...' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Programar Cita */}
      {isCitaOpen && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-left">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Agendar Nueva Cita</h3>
              <button onClick={() => setIsCitaOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCita} className="p-4 space-y-3.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Título de la cita *</label>
                <input type="text" value={citaTitle} onChange={e => setCitaTitle(e.target.value)}
                  placeholder="Ej: Firma de Promesa de Compraventa" 
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Propiedad relacionada</label>
                  <select value={citaPropId} onChange={e => setCitaPropId(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold">
                    <option value="">Ninguna</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.unitCode} - {p.project?.name || ''}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Asesor asignado *</label>
                  <select value={citaAgentId} onChange={e => setCitaAgentId(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold">
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.firstName} {a.lastName || ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Fecha *</label>
                  <input type="date" value={citaDate} onChange={e => setCitaDate(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold" required />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Hora inicio *</label>
                  <input type="time" value={citaStartTime} onChange={e => setCitaStartTime(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold" required />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Hora fin *</label>
                  <input type="time" value={citaEndTime} onChange={e => setCitaEndTime(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Tipo de cita</label>
                  <select value={citaType} onChange={e => setCitaType(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold">
                    <option value="REUNION">Reunión Presencial</option>
                    <option value="VISITA_PROYECTO">Visita a Proyecto</option>
                    <option value="PRESENTACION">Presentación de Unidad</option>
                    <option value="LLAMADA">Llamada/Videollamada</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Estado de la cita</label>
                  <select value={citaStatus} onChange={e => setCitaStatus(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold">
                    <option value="PENDIENTE">Programada (Pendiente)</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="COMPLETADA">Realizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Ubicación</label>
                  <input type="text" value={citaLocation} onChange={e => setCitaLocation(e.target.value)} placeholder="Ej: Sala de ventas San Isidro" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold" />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Enlace videollamada</label>
                  <input type="url" value={citaVideoLink} onChange={e => setCitaVideoLink(e.target.value)} placeholder="Google Meet, Zoom, etc." className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold" />
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Notas de la cita</label>
                <textarea value={citaDesc} onChange={e => setCitaDesc(e.target.value)} placeholder="Especificaciones de la reunión..." className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white resize-none h-14" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsCitaOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={submittingCita} className="px-4 py-1.5 bg-brand-green text-white text-xs rounded-lg font-bold shadow-xs">
                  {submittingCita ? 'Agendando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Nueva Nota */}
      {isNoteOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Agregar Nota al Historial</h3>
              <button onClick={() => setIsNoteOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNote} className="p-4 space-y-3.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Contenido de la nota *</label>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  placeholder="Ej: El cliente está interesado en comprar en preventa si se le da un descuento del 3%..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white resize-none h-32 font-semibold"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsNoteOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={submittingNote} className="px-4 py-1.5 bg-brand-green text-white text-xs rounded-lg font-bold">
                  {submittingNote ? 'Guardando...' : 'Guardar Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Registrar Llamada */}
      {isCallOpen && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Registrar Registro de Llamada</h3>
              <button onClick={() => setIsCallOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCall} className="p-4 space-y-3.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Título de la llamada *</label>
                <input type="text" value={callTitle} onChange={e => setCallTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  required
                />
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Resultado de la llamada *</label>
                <select value={callResult} onChange={e => setCallResult(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold">
                  <option value="CONTESTO">Contestó</option>
                  <option value="NO_CONTESTO">No Contestó</option>
                  <option value="OCUPADO">Llamada Ocupada</option>
                  <option value="MENSAJE_VOZ">Dejó Mensaje de Voz</option>
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Detalles / conversación</label>
                <textarea value={callDetails} onChange={e => setCallDetails(e.target.value)}
                  placeholder="Indica qué hablaron o próximos pasos..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white resize-none h-16 font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsCallOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={submittingCall} className="px-4 py-1.5 bg-brand-green text-white text-xs rounded-lg font-bold">
                  {submittingCall ? 'Guardando...' : 'Registrar Llamada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Registrar Mensaje */}
      {isMessageOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Registrar Mensaje Enviado</h3>
              <button onClick={() => setIsMessageOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveMessage} className="p-4 space-y-3.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Canal de envío</label>
                <select value={msgChannel} onChange={e => setMsgChannel(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold">
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CORREO">Correo Electrónico</option>
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Contenido del mensaje *</label>
                <textarea value={msgDetails} onChange={e => setMsgDetails(e.target.value)}
                  placeholder="Copia el texto del mensaje enviado..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white resize-none h-24 font-semibold"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsMessageOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={submittingMsg} className="px-4 py-1.5 bg-brand-green text-white text-xs rounded-lg font-bold">
                  {submittingMsg ? 'Guardando...' : 'Registrar Mensaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Registrar Contrato (Cerrar Trato) */}
      {isContractOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden text-left">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Registrar Cierre y Firma de Contrato</h3>
              <button onClick={() => setIsContractOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Desarrollador</label>
                  <select value={selectedDevId} onChange={e => {
                      setSelectedDevId(e.target.value);
                      setSelectedProjId('');
                      setContractData(prev => ({ ...prev, propertyId: '' }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="">Selecciona...</option>
                    {Array.from(new Map(properties.map(p => p.project?.developer).filter(Boolean).map(d => [d.id, d])).values()).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Proyecto</label>
                  <select value={selectedProjId} onChange={e => {
                      setSelectedProjId(e.target.value);
                      setContractData(prev => ({ ...prev, propertyId: '' }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="">Selecciona...</option>
                    {Array.from(new Map(properties.filter(p => !selectedDevId || p.project?.developerId === selectedDevId).map(p => p.project).filter(Boolean).map(pr => [pr.id, pr])).values()).map((pr: any) => (
                      <option key={pr.id} value={pr.id}>{pr.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Propiedad *</label>
                  <select value={contractData.propertyId} onChange={e => setContractData(prev => ({ ...prev, propertyId: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold"
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
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Tipo de documento</label>
                  <select value={contractData.type} onChange={e => setContractData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="COMPRAVENTA">Compraventa</option>
                    <option value="SEPARACION">Separación</option>
                    <option value="ALQUILER">Alquiler</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Monto de cierre *</label>
                  <input type="number" value={contractData.amount} onChange={e => setContractData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Monto"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                    required
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-medium text-brand-green ">Moneda</label>
                  <select value={contractData.currency} onChange={e => setContractData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                  >
                    <option value="USD">Dólares ($)</option>
                    <option value="PEN">Soles (S/)</option>
                    <option value="EUR">Euros (€)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-brand-green ">Comentarios de cierre</label>
                <textarea value={contractData.notes} onChange={e => setContractData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Indica las cuotas, condiciones acordadas..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white resize-none h-16"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsContractOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">Cancelar</button>
                <button
                  type="button"
                  disabled={submittingContract}
                  onClick={async () => {
                    if (!contractData.propertyId || !contractData.amount) {
                      alert('Por favor selecciona la unidad y el monto de cierre.');
                      return;
                    }
                    
                    const c = opportunity.contact;
                    if (!c || !c.dni || !c.address || !c.phone || !c.email) {
                      alert('⚠️ ACCIÓN REQUERIDA:\nPara registrar un cierre y firma de contrato, es OBLIGATORIO que el cliente tenga sus datos completos registrados (DNI, Dirección, Teléfono, Correo).\n\nPor favor, actualiza los datos del contacto antes de proceder.');
                      return;
                    }

                    setSubmittingContract(true);
                    try {
                      // 1. Crear contrato
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

                      // 2. Actualizar propiedad a VENDIDO
                      await updateProperty(contractData.propertyId, { status: 'VENDIDO' });

                      // 3. Promover contacto a CLIENTE formal
                      await updateContact(opportunity.contactId, { type: 'CLIENTE' });

                      // 4. Actualizar etapa
                      await updateOpportunityStage(opportunity.id, 'CIERRE_GANADO');
                      
                      alert('🎉 ¡Venta registrada y trato cerrado con éxito!\n\nSe ha actualizado:\n- El inventario (Unidad vendida)\n- El perfil del cliente\n- La negociación cerrada');
                      onClose();
                      window.location.reload();
                    } catch (err: any) {
                      alert(err.message || 'Error al registrar la venta');
                    } finally {
                      setSubmittingContract(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-brand-green text-white text-xs rounded-lg font-bold shadow-xs shadow-brand-green/20"
                >
                  {submittingContract ? 'Registrando...' : 'Confirmar Cierre'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Secondary Modal */}
      {isEditContactOpen && (
        <NewContactModal
          isOpen={isEditContactOpen}
          onClose={() => setIsEditContactOpen(false)}
          initialData={opportunity.contact}
          onSuccess={() => {
            setIsEditContactOpen(false);
            alert('¡Datos del contacto actualizados con éxito!');
            window.location.reload();
          }}
        />
      )}

    </div>
  );
}
