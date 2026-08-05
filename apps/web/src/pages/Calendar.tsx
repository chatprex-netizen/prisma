import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { NewAppointmentModal } from '../components/modals/NewAppointmentModal';
import { getAppointments, deleteAppointment } from '../lib/api';

const WEEK_DAYS = ['Lun 4', 'Mar 5', 'Mié 6', 'Jue 7', 'Vie 8', 'Sáb 9', 'Dom 10'];
const MONTH_DAYS_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

export function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppointmentsData = async () => {
    try {
      const res = await getAppointments();
      if (res.data) {
        const mapped = res.data.map((app: any) => ({
          id: app.id,
          title: app.title,
          type: app.type,
          status: app.status,
          day: new Date(app.startAt).getDate(),
          startHour: new Date(app.startAt).getHours(),
          duration: (new Date(app.endAt).getTime() - new Date(app.startAt).getTime()) / (1000 * 60 * 60),
          contact: app.contact ? `${app.contact.firstName} ${app.contact.lastName}` : 'Sin contacto',
          color: 'bg-blue-100 border-blue-200 text-blue-800',
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

  // RENDER: DAY VIEW
  const renderDayView = () => {
    return (
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="grid grid-cols-12 sticky top-0 bg-white z-20 border-b border-slate-200 shadow-sm">
          <div className="col-span-2 p-3 text-center border-r border-slate-100 flex items-end justify-end pb-2">
            <span className="text-xs text-slate-400 font-medium">GMT-5</span>
          </div>
          <div className="col-span-10 p-3 text-center">
            <span className="text-sm font-medium text-brand-green">Lun 4</span>
          </div>
        </div>

        {/* Time Slots */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-12 border-b border-slate-100 h-24 group">
              <div className="col-span-2 p-2 text-right border-r border-slate-100 text-xs text-slate-400 font-medium relative -top-3">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
              <div className="col-span-10 hover:bg-slate-50 transition-colors"></div>
            </div>
          ))}

          {/* Events */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-12">
            <div className="col-span-2 border-r border-transparent"></div>
            <div className="col-span-10 relative">
              {appointments.filter(app => app.day === 1).map(event => {
                const topPx = (event.startHour - 8) * 96; // 96px per hour
                const heightPx = Math.max(event.duration, 0.5) * 96;
                return (
                  <div 
                    key={event.id}
                    className={`absolute w-[95%] left-[2.5%] rounded-md border p-3 shadow-sm pointer-events-auto cursor-pointer hover:shadow-md transition-shadow overflow-hidden flex flex-col group/event ${event.color}`}
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-sm leading-tight mb-1">{event.title}</div>
                      <button onClick={(e) => handleDelete(e, event.id)} className="opacity-0 group-hover/event:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs opacity-80 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {event.startHour}:00 - {event.startHour + event.duration}:00
                    </div>
                    <div className="text-xs opacity-80 truncate">
                      Contacto: {event.contact}
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

  // RENDER: WEEK VIEW
  const renderWeekView = () => {
    return (
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 sticky top-0 bg-white z-20 border-b border-slate-200 shadow-sm">
          <div className="p-3 text-center border-r border-slate-100 flex items-end justify-end pb-2">
            <span className="text-xs text-slate-400 font-medium">GMT-5</span>
          </div>
          {WEEK_DAYS.map((day, idx) => (
            <div key={day} className="p-3 text-center border-r border-slate-100">
              <span className={`text-sm font-medium ${idx === 0 ? 'text-brand-green' : 'text-slate-600'}`}>
                {day.split(' ')[0]}
              </span>
              <div className={`text-2xl mt-1 ${idx === 0 ? 'text-brand-green font-bold' : 'text-slate-900'}`}>
                {day.split(' ')[1]}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100 h-16 group">
              <div className="p-2 text-right border-r border-slate-100 text-xs text-slate-400 font-medium relative -top-3">
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
              const dayEvents = appointments.filter(app => app.day === colIdx + 1);
              return (
                <div key={colIdx} className="col-span-1 relative">
                  {dayEvents.map(event => {
                    const topPx = (event.startHour - 8) * 64; 
                    const heightPx = Math.max(event.duration, 0.5) * 64;
                    return (
                      <div 
                        key={event.id}
                        className={`absolute w-[95%] left-[2.5%] rounded-md border p-2 shadow-sm pointer-events-auto cursor-pointer hover:shadow-md transition-shadow overflow-hidden flex flex-col group/event ${event.color}`}
                        style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="font-semibold text-xs leading-tight mb-1 truncate">{event.title}</div>
                          <button onClick={(e) => handleDelete(e, event.id)} className="opacity-0 group-hover/event:opacity-100 text-red-500 hover:bg-red-50 rounded shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] opacity-80 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {event.startHour}:00 - {event.startHour + event.duration}:00
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          
          {/* Current Time Line Indicator */}
          <div className="absolute top-[160px] left-0 w-full h-px bg-red-400 z-10 grid grid-cols-8 pointer-events-none">
             <div className="col-span-1 relative">
               <div className="absolute -top-2 right-1 text-[10px] bg-red-400 text-white px-1.5 rounded font-bold">10:30</div>
             </div>
             <div className="col-span-7"></div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER: MONTH VIEW
  const renderMonthView = () => {
    // Generate a 5-week grid (35 days) for August 2026 (starts Saturday, but let's mock it simply 1-31 padded)
    const days = [];
    // Pad previous month days
    for(let i=27; i<=31; i++) days.push({ date: i, currentMonth: false });
    // Current month days
    for(let i=1; i<=30; i++) days.push({ date: i, currentMonth: true });

    return (
      <div className="min-w-[800px] h-full flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 bg-white border-b border-slate-200">
          {MONTH_DAYS_HEADERS.map(day => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,1fr)] bg-slate-100 gap-px">
          {days.map((dayObj, i) => {
            // Find appointments for this day (mock logic: dayObj.date matches app.day if currentMonth)
            const dayEvents = dayObj.currentMonth ? appointments.filter(a => a.day === dayObj.date) : [];
            
            return (
              <div key={i} className={`bg-white p-1.5 flex flex-col ${dayObj.currentMonth ? 'hover:bg-slate-50 transition-colors cursor-pointer' : 'bg-slate-50/50'}`}>
                <div className={`text-sm p-1 font-medium w-8 h-8 flex items-center justify-center rounded-full mb-1 ${dayObj.currentMonth ? (dayObj.date === 4 ? 'bg-brand-green text-white' : 'text-slate-700') : 'text-slate-400'}`}>
                  {dayObj.date}
                </div>
                
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className={`px-2 py-1 text-xs truncate rounded border font-medium flex justify-between items-center group/event ${ev.color}`}>
                      <span>{ev.startHour}:00 - {ev.title}</span>
                      <button onClick={(e) => handleDelete(e, ev.id)} className="opacity-0 group-hover/event:opacity-100 text-red-500 hover:bg-red-50 rounded shrink-0 ml-1">
                        <Trash2 className="w-3 h-3" />
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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto h-full flex flex-col bg-slate-50/30">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Agenda</h1>
            <p className="text-xs text-slate-500 mt-0.5">Agosto 2026</p>
          </div>
          
          <div className="flex items-center justify-between md:justify-start gap-2 bg-white border border-slate-200 rounded-lg p-1 w-full md:w-auto shadow-sm">
            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">Hoy</span>
            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select 
            value={view}
            onChange={(e) => setView(e.target.value as any)}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm outline-none focus:border-brand-green cursor-pointer"
          >
            <option value="month">Mensual</option>
            <option value="week">Semanal</option>
            <option value="day">Diario</option>
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Agendar Cita
          </button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-xl shadow-sm custom-scrollbar flex flex-col">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAppointmentsData}
      />
    </div>
  );
}
