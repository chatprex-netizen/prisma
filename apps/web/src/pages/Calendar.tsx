import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { NewAppointmentModal } from '../components/modals/NewAppointmentModal';
import { getAppointments, deleteAppointment } from '../lib/api';

const WEEK_DAYS = ['Lun 4', 'Mar 5', 'Mié 6', 'Jue 7', 'Vie 8', 'Sáb 9', 'Dom 10'];
const MONTH_DAYS_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

export function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppointmentsData = async () => {
    try {
      const res = await getAppointments();
      if (res.data) {
        const mapped = res.data.map((app: any) => ({
          ...app,
          day: new Date(app.startAt).getDate(),
          startHour: new Date(app.startAt).getHours(),
          duration: (new Date(app.endAt).getTime() - new Date(app.startAt).getTime()) / (1000 * 60 * 60),
          contactName: app.contact ? `${app.contact.firstName} ${app.contact.lastName || ''}`.trim() : 'Sin contacto',
          color: 'bg-blue-50 border-blue-100 text-blue-800',
        }));
        setAppointments(mapped);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAppointmentsData();
  }, []);

  const handleDelete = async (e: any, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        await deleteAppointment(id);
        fetchAppointmentsData();
      } catch (error) {
        alert('Error al eliminar cita');
      }
    }
  };

  // RENDER: DAY VIEW (Compact)
  const renderDayView = () => {
    return (
      <div className="w-full min-w-0">
        {/* Header */}
        <div className="grid grid-cols-12 sticky top-0 bg-white z-20 border-b border-slate-200 shadow-sm">
          <div className="col-span-3 sm:col-span-2 p-2.5 text-right border-r border-slate-100 flex items-end justify-end pb-1.5">
            <span className="text-[10px] text-slate-400 font-bold">GMT-5</span>
          </div>
          <div className="col-span-9 sm:col-span-10 p-2.5 text-center">
            <span className="text-xs sm:text-sm font-bold text-brand-green">Lunes 4</span>
          </div>
        </div>

        {/* Time Slots */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-12 border-b border-slate-100 h-16 sm:h-20 group">
              <div className="col-span-3 sm:col-span-2 p-1.5 text-right border-r border-slate-100 text-[10px] sm:text-xs text-slate-400 font-semibold relative -top-2">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
              <div className="col-span-9 sm:col-span-10 hover:bg-slate-50 transition-colors"></div>
            </div>
          ))}

          {/* Events */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-12">
            <div className="col-span-3 sm:col-span-2 border-r border-transparent"></div>
            <div className="col-span-9 sm:col-span-10 relative">
              {appointments.filter(app => app.day === 4).map(event => {
                const topPx = (event.startHour - 8) * 64; // Match heights
                const heightPx = Math.max(event.duration, 0.5) * 64;
                return (
                  <div 
                    key={event.id}
                    onClick={() => { setSelectedApp(event); setIsModalOpen(true); }}
                    className={`absolute w-[95%] left-[2.5%] rounded-lg border p-2 shadow-2xs pointer-events-auto cursor-pointer hover:shadow-xs transition-all overflow-hidden flex flex-col group/event ${event.color}`}
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div className="font-bold text-[11px] sm:text-xs leading-tight mb-0.5 truncate">{event.title}</div>
                      <button onClick={(e) => handleDelete(e, event.id)} className="opacity-0 group-hover/event:opacity-100 p-0.5 text-red-500 hover:bg-red-100 rounded shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-90 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 shrink-0" />
                      {event.startHour}:00 - {event.startHour + event.duration}:00
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-90 truncate font-semibold mt-0.5">
                      Contacto: {event.contactName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER: WEEK VIEW (Responsive & Compact)
  const renderWeekView = () => {
    return (
      <div className="w-full min-w-0">
        {/* Header */}
        <div className="grid grid-cols-8 sticky top-0 bg-white z-20 border-b border-slate-200 shadow-sm">
          <div className="p-2 text-right border-r border-slate-100 flex items-end justify-end pb-1">
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold">GMT-5</span>
          </div>
          {WEEK_DAYS.map((day, idx) => (
            <div key={day} className="p-1 sm:p-2 text-center border-r border-slate-100 min-w-0">
              <span className={`text-[10px] sm:text-xs font-bold block truncate ${idx === 0 ? 'text-brand-green' : 'text-slate-500'}`}>
                {day.split(' ')[0]}
              </span>
              <div className={`text-xs sm:text-lg mt-0.5 ${idx === 0 ? 'text-brand-green font-extrabold' : 'text-slate-900 font-bold'}`}>
                {day.split(' ')[1]}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100 h-12 sm:h-14 group">
              <div className="p-1 text-right border-r border-slate-100 text-[9px] sm:text-xs text-slate-400 font-bold relative -top-2">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div key={colIdx} className="border-r border-slate-100 hover:bg-slate-50 transition-colors"></div>
              ))}
            </div>
          ))}

          {/* Events Overlay */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8">
            <div className="col-span-1 border-r border-transparent"></div>
            {Array.from({ length: 7 }).map((_, colIdx) => {
              const dayEvents = appointments.filter(app => app.day === colIdx + 4); // Aligning mockup dates (Lun 4)
              return (
                <div key={colIdx} className="col-span-1 relative">
                  {dayEvents.map(event => {
                    const topPx = (event.startHour - 8) * 48; // Match heights
                    const heightPx = Math.max(event.duration, 0.5) * 48;
                    return (
                      <div 
                        key={event.id}
                        onClick={() => { setSelectedApp(event); setIsModalOpen(true); }}
                        className={`absolute w-[95%] left-[2.5%] rounded-lg border p-1.5 shadow-2xs pointer-events-auto cursor-pointer hover:shadow-xs transition-all overflow-hidden flex flex-col group/event ${event.color}`}
                        style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="font-extrabold text-[9px] sm:text-[11px] leading-tight mb-0.5 truncate">{event.title}</div>
                          <button onClick={(e) => handleDelete(e, event.id)} className="opacity-0 group-hover/event:opacity-100 text-red-500 hover:bg-red-50 rounded shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[8px] sm:text-[9px] opacity-90 flex items-center gap-0.5 font-semibold">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          {event.startHour}h-{event.startHour + event.duration}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // RENDER: MONTH VIEW (Fully Responsive & Compact)
  const renderMonthView = () => {
    // Pad previous month days (Mock for August 2026 starts Saturday: pad 5 days)
    const days = [];
    for(let i=27; i<=31; i++) days.push({ date: i, currentMonth: false });
    for(let i=1; i<=30; i++) days.push({ date: i, currentMonth: true });

    return (
      <div className="w-full min-w-0 h-full flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 bg-white border-b border-slate-200">
          {MONTH_DAYS_HEADERS.map(day => (
            <div key={day} className="p-2 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-0 truncate">
              {/* Shorten words on mobile view */}
              <span className="hidden sm:inline">{day}</span>
              <span className="inline sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Grid (Compact row heights) */}
        <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(64px,1fr)] sm:auto-rows-[minmax(110px,1fr)] bg-slate-100 gap-px">
          {days.map((dayObj, i) => {
            const dayEvents = dayObj.currentMonth ? appointments.filter(a => a.day === dayObj.date) : [];
            
            return (
              <div key={i} className={`bg-white p-1 flex flex-col ${dayObj.currentMonth ? 'hover:bg-slate-50 transition-colors cursor-pointer' : 'bg-slate-50/50'}`}>
                <div className={`text-xxs sm:text-xs p-0.5 font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-1 shrink-0 ${dayObj.currentMonth ? (dayObj.date === 4 ? 'bg-brand-green text-white' : 'text-slate-700') : 'text-slate-400'}`}>
                  {dayObj.date}
                </div>
                
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0.5">
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={(e) => { e.stopPropagation(); setSelectedApp(ev); setIsModalOpen(true); }}
                      className={`px-1 py-0.5 text-[8px] sm:text-xxs truncate rounded border font-semibold flex justify-between items-center group/event ${ev.color} cursor-pointer`}
                      title={`${ev.startHour}:00 - ${ev.title}`}
                    >
                      <span className="truncate">{ev.startHour}h {ev.title}</span>
                      <button onClick={(e) => handleDelete(e, ev.id)} className="opacity-0 group-hover/event:opacity-100 text-red-500 hover:bg-red-50 rounded shrink-0 ml-0.5 hidden sm:block">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto h-full flex flex-col bg-slate-50/30 animate-fade-in text-left">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0 mb-5">
        <div className="flex flex-row items-center justify-between md:justify-start gap-4 md:gap-6 w-full md:w-auto">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agenda de Citas</h1>
            <p className="text-xs text-slate-500 mt-0.5">Agosto 2026</p>
          </div>
          
          <div className="flex items-center justify-between md:justify-start gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-1.5">Hoy</span>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select 
            value={view}
            onChange={(e) => setView(e.target.value as any)}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs outline-none focus:border-brand-green cursor-pointer"
          >
            <option value="month">Mensual</option>
            <option value="week">Semanal</option>
            <option value="day">Diario</option>
          </select>
          <button 
            onClick={() => { setSelectedApp(null); setIsModalOpen(true); }}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-xl shadow-2xs custom-scrollbar flex flex-col min-h-0">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedApp(null); }} 
        onSuccess={fetchAppointmentsData}
        initialData={selectedApp}
      />
    </div>
  );
}
