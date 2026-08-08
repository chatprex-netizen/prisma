import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createUser, updateUser } from '../../lib/api';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function NewUserModal({ isOpen, onClose, onSuccess, initialData }: NewUserModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AGENTE');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || '');
      setLastName(initialData.lastName || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setPassword(''); // Always empty initially when editing
      setRole(initialData.role || 'AGENTE');
      setIsActive(initialData.isActive !== false);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRole('AGENTE');
      setIsActive(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        firstName,
        lastName,
        email,
        phone,
        role,
        isActive
      };

      // Password is required when creating, optional when updating
      if (password) {
        payload.password = password;
      } else if (!initialData) {
        throw new Error('La contraseña es obligatoria para nuevos usuarios');
      }

      if (initialData) {
        await updateUser(initialData.id, payload);
      } else {
        await createUser(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err?.message || 'Error al guardar los datos del usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {initialData ? 'Modifica los accesos y datos del usuario' : 'Agrega un nuevo miembro a tu equipo'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 md:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-left">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            {/* Info Básica */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold">1</span>
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-brand-green">Nombre *</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-800" 
                    placeholder="Ej: Juan" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-brand-green">Apellido *</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-800" 
                    placeholder="Ej: Pérez" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-brand-green">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-800" 
                    placeholder="juan.perez@inmobiliaria.com" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-brand-green">Teléfono</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-800" 
                    placeholder="+51 987 654 321" 
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Acceso y Permisos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold">2</span>
                Acceso y Permisos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-brand-green">
                    {initialData ? 'Cambiar Contraseña' : 'Contraseña Temporal *'}
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-800" 
                    placeholder={initialData ? "Dejar en blanco para mantener" : "••••••••"} 
                    required={!initialData} 
                  />
                  <p className="text-[10px] text-slate-400">
                    {initialData ? 'Solo llena este campo si deseas cambiar su contraseña.' : 'Contraseña provisional para el primer acceso.'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-brand-green">Rol del Usuario *</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-800"
                  >
                    <option value="AGENTE">Agente Comercial</option>
                    <option value="ASISTENTE">Asistente</option>
                    <option value="GERENTE_COMERCIAL">Gerente Comercial (Supervisor)</option>
                    <option value="ADMIN">Administrador (Control Total)</option>
                  </select>
                </div>
                
                <div className="space-y-1 md:col-span-2 mt-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green" 
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Usuario Activo</p>
                      <p className="text-xs text-slate-500">Si se desactiva, el usuario no podrá iniciar sesión en el sistema.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-brand-greenHover rounded-lg transition-colors shadow-sm shadow-brand-green/20 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
