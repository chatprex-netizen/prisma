import { useState, useEffect } from 'react';
import { X, Calendar, Plus, FileText, CheckCircle2, UploadCloud } from 'lucide-react';
import { createContract, getContacts, getProperties, getUsers } from '../../lib/api';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewContractModal({ isOpen, onClose, onSuccess }: NewContractModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  // Closing conditions state
  const [paymentType, setPaymentType] = useState<'CONTADO' | 'FINANCIADO'>('CONTADO');
  const [initialPayment, setInitialPayment] = useState<string>('');
  const [monthsTerm, setMonthsTerm] = useState<string>('12');
  const [interestRate, setInterestRate] = useState<string>('0');
  const [paymentDayRule, setPaymentDayRule] = useState<'5' | '20' | 'CUSTOM'>('5');
  const [customStartDate, setCustomStartDate] = useState<string>('');

  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [formData, setFormData] = useState({
    buyerId: '',
    type: 'COMPRAVENTA',
    status: 'BORRADOR',
    propertyId: '',
    currency: 'USD',
    amount: '',
    notes: '',
    agentId: ''
  });

  useEffect(() => {
    if (isOpen) {
      getContacts().then(res => setContacts(res.data || [])).catch(console.error);
      getProperties().then(res => setProperties(res.data || [])).catch(console.error);
      getUsers()
        .then(res => {
          const list = res.data || [];
          setUsers(list);
          if (list.length > 0) {
            setFormData(prev => ({ ...prev, agentId: list[0].id }));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get unique developers from properties
  const developersList = Array.from(
    new Map(
      properties
        .map(p => p.project?.developer)
        .filter(Boolean)
        .map(dev => [dev.id, dev])
    ).values()
  );

  // Get projects filtered by selected developer
  const projectsList = Array.from(
    new Map(
      properties
        .filter(p => !selectedDeveloperId || p.project?.developerId === selectedDeveloperId)
        .map(p => p.project)
        .filter(Boolean)
        .map(proj => [proj.id, proj])
    ).values()
  );

  // Get properties filtered by selected project
  const propertiesList = properties.filter(p => {
    const matchesProject = !selectedProjectId || p.projectId === selectedProjectId;
    const matchesDeveloper = !selectedDeveloperId || p.project?.developerId === selectedDeveloperId;
    return matchesProject && matchesDeveloper;
  });

  const handleDeveloperChange = (devId: string) => {
    setSelectedDeveloperId(devId);
    setSelectedProjectId('');
    setFormData(prev => ({ ...prev, propertyId: '' }));
  };

  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    setFormData(prev => ({ ...prev, propertyId: '' }));
  };

  // Generate Payment Schedule dynamically
  const generateSchedule = () => {
    const totalAmount = parseFloat(formData.amount) || 0;
    if (totalAmount <= 0) return [];

    if (paymentType === 'CONTADO') {
      const pDate = new Date();
      return [{
        num: 1,
        date: pDate.toLocaleDateString('es-PE'),
        percentage: '100%',
        quota: totalAmount.toFixed(2),
        balance: '0.00'
      }];
    }

    const initial = parseFloat(initialPayment) || 0;
    const term = parseInt(monthsTerm) || 1;
    const interest = parseFloat(interestRate) || 0;

    const financedAmount = totalAmount - initial;
    if (financedAmount <= 0) return [];

    const schedule = [];
    let currentBalance = financedAmount;

    // Monthly installment calculation (PMT formula with interest rate)
    let monthlyQuota = financedAmount / term;
    if (interest > 0) {
      const r = interest / 100;
      monthlyQuota = (financedAmount * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
    }

    // Determine first payment date
    let baseDate = new Date();
    if (paymentDayRule === 'CUSTOM' && customStartDate) {
      baseDate = new Date(customStartDate + 'T12:00:00');
    } else {
      const targetDay = paymentDayRule === '5' ? 5 : 20;
      baseDate.setDate(targetDay);
      // If payment day has passed this month, start next month
      if (baseDate.getTime() < Date.now()) {
        baseDate.setMonth(baseDate.getMonth() + 1);
      }
    }

    for (let i = 1; i <= term; i++) {
      const payDate = new Date(baseDate);
      payDate.setMonth(baseDate.getMonth() + (i - 1));

      // Calculate balance reduction
      let interestCost = 0;
      let amortization = monthlyQuota;
      if (interest > 0) {
        interestCost = currentBalance * (interest / 100);
        amortization = monthlyQuota - interestCost;
      }
      currentBalance = Math.max(0, currentBalance - amortization);

      const percentage = ((monthlyQuota / totalAmount) * 100).toFixed(1) + '%';

      schedule.push({
        num: i,
        date: payDate.toLocaleDateString('es-PE'),
        percentage,
        quota: monthlyQuota.toFixed(2),
        balance: currentBalance.toFixed(2)
      });
    }

    return schedule;
  };

  const schedule = generateSchedule();

  const handleSubmit = async () => {
    if (!formData.buyerId || !formData.amount || !formData.propertyId) {
      alert('El Comprador, la Propiedad y el Monto son obligatorios');
      return;
    }

    if (!window.confirm('¿Confirmas que deseas registrar este contrato?')) {
      return;
    }

    try {
      setLoading(true);

      const termsData = {
        paymentType,
        initialPayment: paymentType === 'FINANCIADO' ? parseFloat(initialPayment) || 0 : 0,
        monthsTerm: paymentType === 'FINANCIADO' ? parseInt(monthsTerm) || 0 : 0,
        interestRate: paymentType === 'FINANCIADO' ? parseFloat(interestRate) || 0 : 0,
        paymentDayRule,
        customStartDate: paymentDayRule === 'CUSTOM' ? customStartDate : null,
        schedule
      };

      await createContract({
        ...formData,
        amount: parseFloat(formData.amount),
        content: `<h1>Contrato de ${formData.type}</h1><p>Monto: ${formData.amount} ${formData.currency}</p>`, // Database content constraint
        terms: termsData,
        number: `DOC-${Date.now()}`
      });

      alert('Contrato registrado exitosamente.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Error al registrar el contrato');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Registrar Nuevo Contrato</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {/* Section 1: Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Comprador (Cliente) *</label>
              <select 
                value={formData.buyerId}
                onChange={e => setFormData({...formData, buyerId: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="">Seleccionar cliente...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Tipo de Contrato *</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="SEPARACION">Separación</option>
                <option value="RESERVA">Reserva</option>
                <option value="COMPRAVENTA">Compraventa</option>
                <option value="ALQUILER">Alquiler</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Estado *</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="BORRADOR">Borrador</option>
                <option value="ENVIADO">Enviado</option>
                <option value="FIRMADO">Firmado</option>
              </select>
            </div>
          </div>

          {/* Section 2: Detalles del Cierre */}
          <div className="p-3.5 border border-slate-100 rounded-lg bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Condiciones del Cierre</span>
            
            {/* Desarrollador y Proyecto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Desarrollador</label>
                <select 
                  value={selectedDeveloperId}
                  onChange={e => handleDeveloperChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  <option value="">Selecciona desarrollador...</option>
                  {developersList.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Proyecto</label>
                <select 
                  value={selectedProjectId}
                  onChange={e => handleProjectChange(e.target.value)}
                  disabled={!selectedDeveloperId}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Selecciona proyecto...</option>
                  {projectsList.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Propiedad y Asesor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Propiedad Inmobiliaria *</label>
                <select 
                  value={formData.propertyId}
                  onChange={e => setFormData({...formData, propertyId: e.target.value})}
                  disabled={!selectedProjectId}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Selecciona unidad...</option>
                  {propertiesList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.unitCode} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Asesor que cerró *</label>
                <select 
                  value={formData.agentId}
                  onChange={e => setFormData({...formData, agentId: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Moneda *</label>
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  translate="no"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white notranslate"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Monto Final *</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="Ej. 120000"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Condición Financiera</label>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPaymentType('CONTADO')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${paymentType === 'CONTADO' ? 'bg-brand-green text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Al contado
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('FINANCIADO')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${paymentType === 'FINANCIADO' ? 'bg-brand-green text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Financiado
                  </button>
                </div>
              </div>
            </div>

            {/* Financed Terms Config */}
            {paymentType === 'FINANCIADO' && (
              <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-3 animate-slide-down">
                <span className="text-xs font-bold text-slate-600 block">Condiciones de Financiamiento</span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-slate-700">Monto Inicial (Cuota Inicial)</label>
                    <input 
                      type="number" 
                      value={initialPayment}
                      onChange={e => setInitialPayment(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-slate-700">Plazo (Meses)</label>
                    <input 
                      type="number" 
                      value={monthsTerm}
                      onChange={e => setMonthsTerm(e.target.value)}
                      placeholder="Ej. 12"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-slate-700">Interés Mensual (%)</label>
                    <input 
                      type="number" 
                      value={interestRate}
                      onChange={e => setInterestRate(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-slate-700">Fecha de Pago</label>
                    <select
                      value={paymentDayRule}
                      onChange={e => setPaymentDayRule(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
                    >
                      <option value="5">Días 5 de cada mes</option>
                      <option value="20">Días 20 de cada mes</option>
                      <option value="CUSTOM">Personalizar día...</option>
                    </select>
                  </div>
                </div>

                {paymentDayRule === 'CUSTOM' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-medium text-slate-700">Fecha de Primer Pago</label>
                      <input 
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Schedule Table */}
            {schedule.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <span className="text-[10px] font-bold text-slate-500 block px-3 py-1.5 bg-slate-50 border-b border-slate-200">Cronograma de Pagos Generado</span>
                <div className="max-h-[160px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">N°</th>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2 text-right">%</th>
                        <th className="px-3 py-2 text-right">Cuota</th>
                        <th className="px-3 py-2 text-right">Saldo Restante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedule.map((item) => (
                        <tr key={item.num} className="hover:bg-slate-50/50">
                          <td className="px-3 py-1.5 text-slate-500 font-medium">{item.num}</td>
                          <td className="px-3 py-1.5 text-slate-700 font-medium">{item.date}</td>
                          <td className="px-3 py-1.5 text-slate-600 text-right font-medium">{item.percentage}</td>
                          <td className="px-3 py-1.5 text-slate-900 font-bold text-right">{formData.currency === 'PEN' ? 'S/' : formData.currency === 'EUR' ? '€' : '$'} {parseFloat(item.quota).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-1.5 text-slate-500 text-right">{formData.currency === 'PEN' ? 'S/' : formData.currency === 'EUR' ? '€' : '$'} {parseFloat(item.balance).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Notas / Comentarios</label>
              <textarea 
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Observaciones adicionales..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white resize-none"
              />
            </div>
          </div>

          {/* Section 3: Sustento de Pago */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">Sustento de Pago</h3>
            <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {fileName ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                  <p className="text-sm font-semibold text-slate-700">Archivo cargado exitosamente</p>
                  <p className="text-xs text-slate-500 mt-1">{fileName}</p>
                  <button className="text-[10px] text-brand-green font-medium mt-1.5 border border-brand-green px-2 py-0.5 rounded hover:bg-brand-green/10">Cambiar archivo</button>
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-sm font-medium text-slate-700">Haz clic o arrastra el voucher aquí</p>
                  <p className="text-xs text-slate-500 mt-0.5">Soporta JPG, PNG y PDF hasta 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Procesando...' : 'Guardar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
}
