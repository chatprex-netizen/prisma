import { useState, useEffect } from 'react';
import { X, UploadCloud, FileImage, CreditCard, User, CheckCircle2 } from 'lucide-react';
import { createContract, getContacts, getProjects } from '../../lib/api';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewContractModal({ isOpen, onClose, onSuccess }: NewContractModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    buyerId: '',
    type: 'COMPRAVENTA',
    status: 'BORRADOR',
    propertyId: '',
    currency: 'USD',
    amount: '',
    notes: '',
    agentId: 'user1'
  });

  useEffect(() => {
    if (isOpen) {
      getContacts().then(res => setContacts(res.data || [])).catch(console.error);
      getProjects().then(res => setProjects(res.data || [])).catch(console.error);
    }
  }, [isOpen]);

  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.buyerId || !formData.amount) {
      alert('Comprador y monto son obligatorios');
      return;
    }
    if (!window.confirm('¿Confirmas que deseas registrar este contrato?')) return;
    try {
      setLoading(true);
      await createContract({
        ...formData,
        amount: parseFloat(formData.amount),
        number: `DOC-${Date.now()}` // Backend also generates this if omitted
      });
      alert('Contrato registrado exitosamente.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al registrar el contrato');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Registrar Nuevo Contrato</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          {/* Section 1: Información Principal */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Comprador (Contacto) *</label>
                <select 
                  value={formData.buyerId}
                  onChange={e => setFormData({...formData, buyerId: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
                >
                  <option value="">Seleccionar contacto...</option>
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
          </div>

          {/* Section 2: Detalles del Cierre */}
          <div className="space-y-4 p-4 md:p-5 border border-slate-100 rounded-lg bg-slate-50/50">
            <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">Condiciones del Cierre</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Propiedad Inmobiliaria *</label>
                <select 
                  value={formData.propertyId}
                  onChange={e => setFormData({...formData, propertyId: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  <option value="">Selecciona proyecto / unidad...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.unitCode})</option>
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
                  <option value="">Selecciona agente...</option>
                  <option value="user1">Juan Pérez (Tú)</option>
                  <option value="user2">María García</option>
                  <option value="user3">Carlos Asesor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-[11px] font-medium text-slate-700">Monto Total *</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="Ej. 120000"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Notas / Comentarios</label>
              <textarea 
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Observaciones adicionales..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white resize-none"
              ></textarea>
            </div>
          </div>

          {/* Section 4: Sustento de Pago */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">Sustento de Pago</h3>
            <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {fileName ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Archivo cargado exitosamente</p>
                  <p className="text-xs text-slate-500 mt-1">{fileName}</p>
                  <button className="text-[10px] text-brand-green font-medium mt-2 border border-brand-green px-2 py-1 rounded hover:bg-brand-green/10">Cambiar archivo</button>
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700">Haz clic o arrastra el voucher aquí</p>
                  <p className="text-xs text-slate-500 mt-0.5">Soporta JPG, PNG y PDF hasta 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Procesando...' : 'Guardar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
}
