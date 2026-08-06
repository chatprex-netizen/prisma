import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Receipt, BookOpen, Plus, Search, DollarSign, ChevronRight } from 'lucide-react';
import { getIncomes, getExpenses, getAccounts } from '../lib/api';

type FinanceTab = 'dashboard' | 'incomes' | 'expenses' | 'accounts';

const incomeTypeLabels: Record<string, string> = {
  VENTA_PROPIEDAD: 'Venta de Propiedad',
  COMISION_PROYECTO: 'Comisión de Proyecto',
  BONO: 'Bono',
  ALQUILER: 'Alquiler',
  SEPARACION: 'Separación',
  RESERVA: 'Reserva',
  CUOTA: 'Cuota',
  INTERESES: 'Intereses',
  OTROS: 'Otros',
};

const expenseCategoryLabels: Record<string, string> = {
  COMISIONES_AGENTES: 'Comisiones Agentes',
  PUBLICIDAD_MARKETING: 'Publicidad y Marketing',
  SERVICIOS_PROFESIONALES: 'Servicios Profesionales',
  SUELDOS_PLANILLA: 'Sueldos y Planilla',
  IMPUESTOS: 'Impuestos',
  MANTENIMIENTO: 'Mantenimiento',
  ARRIENDO_OFICINA: 'Arriendo Oficina',
  UTILITIES: 'Servicios Públicos',
  SEGUROS: 'Seguros',
  VIAJES_TRANSPORTE: 'Viajes y Transporte',
  MATERIALES_OFICINA: 'Materiales de Oficina',
  CAPACITACION: 'Capacitación',
  OTROS: 'Otros',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-50 text-amber-600' },
  COBRADO: { label: 'Cobrado', color: 'bg-emerald-50 text-emerald-600' },
  ANULADO: { label: 'Anulado', color: 'bg-red-50 text-red-600' },
  APROBADO: { label: 'Aprobado', color: 'bg-blue-50 text-blue-600' },
  PAGADO: { label: 'Pagado', color: 'bg-emerald-50 text-emerald-600' },
  RECHAZADO: { label: 'Rechazado', color: 'bg-red-50 text-red-600' },
};

const paymentMethodLabels: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
  TARJETA: 'Tarjeta',
  DEPOSITO: 'Depósito',
};

export function Finances() {
  const location = useLocation();
  const getTabFromPath = (): FinanceTab => {
    if (location.pathname.includes('/finances/incomes')) return 'incomes';
    if (location.pathname.includes('/finances/expenses')) return 'expenses';
    if (location.pathname.includes('/finances/accounts')) return 'accounts';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<FinanceTab>(getTabFromPath());
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inc, exp, acc] = await Promise.allSettled([getIncomes(), getExpenses(), getAccounts()]);
      if (inc.status === 'fulfilled') setIncomes(Array.isArray(inc.value) ? inc.value : []);
      if (exp.status === 'fulfilled') setExpenses(Array.isArray(exp.value) ? exp.value : []);
      if (acc.status === 'fulfilled') setAccounts(Array.isArray(acc.value) ? acc.value : []);
    } catch (err) {
      console.error('Error loading finances:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalIncomes = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0);
  const balance = totalIncomes - totalExpenses;
  const pendingIncomes = incomes.filter(i => i.status === 'PENDIENTE').reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDIENTE').reduce((sum, e) => sum + Number(e.totalAmount || e.amount || 0), 0);

  const tabs: { id: FinanceTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'incomes', label: 'Ingresos', icon: ArrowUpRight },
    { id: 'expenses', label: 'Egresos', icon: ArrowDownRight },
    { id: 'accounts', label: 'Plan Contable', icon: BookOpen },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-green" />
            Administración Financiera
          </h1>
          <p className="text-xs text-slate-500 mt-1">Flujo de caja, ingresos, egresos y plan contable</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Balance Total" value={balance} color="blue" icon={<Wallet className="w-4 h-4" />} />
                <KpiCard title="Total Ingresos" value={totalIncomes} color="green" icon={<ArrowUpRight className="w-4 h-4" />} subtitle={`${incomes.length} registros`} />
                <KpiCard title="Total Egresos" value={totalExpenses} color="red" icon={<ArrowDownRight className="w-4 h-4" />} subtitle={`${expenses.length} registros`} />
                <KpiCard title="Por Cobrar" value={pendingIncomes} color="amber" icon={<Receipt className="w-4 h-4" />} subtitle={`${incomes.filter(i => i.status === 'PENDIENTE').length} pendientes`} />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Últimos Ingresos</h3>
                    <button onClick={() => setActiveTab('incomes')} className="text-xs text-brand-green hover:underline flex items-center gap-1">Ver todos <ChevronRight className="w-3 h-3" /></button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {incomes.slice(0, 5).map(inc => (
                      <div key={inc.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{inc.description?.substring(0, 40) || incomeTypeLabels[inc.type] || inc.type}</p>
                            <p className="text-xs text-slate-400">{inc.contact ? `${inc.contact.firstName} ${inc.contact.lastName}` : '—'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">+S/ {Number(inc.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                          <p className="text-xs text-slate-400">{new Date(inc.date).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                    ))}
                    {incomes.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">Sin ingresos registrados</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Últimos Egresos</h3>
                    <button onClick={() => setActiveTab('expenses')} className="text-xs text-brand-green hover:underline flex items-center gap-1">Ver todos <ChevronRight className="w-3 h-3" /></button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {expenses.slice(0, 5).map(exp => (
                      <div key={exp.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{exp.description?.substring(0, 40) || expenseCategoryLabels[exp.category] || exp.category}</p>
                            <p className="text-xs text-slate-400">{exp.vendorName || '—'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-500">-S/ {Number(exp.totalAmount || exp.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                          <p className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                    ))}
                    {expenses.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">Sin egresos registrados</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Incomes Tab */}
          {activeTab === 'incomes' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900">Cuentas por Cobrar (Ingresos)</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-greenHover transition-colors">
                  <Plus className="w-3.5 h-3.5" />Nuevo Ingreso
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Nro.</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Descripción</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Tipo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Cliente</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Método</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Monto</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {incomes.map(inc => (
                      <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-xs">{inc.number}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{inc.description?.substring(0, 50) || '—'}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">{incomeTypeLabels[inc.type] || inc.type}</span></td>
                        <td className="py-3 px-4 text-slate-600">{inc.contact ? `${inc.contact.firstName} ${inc.contact.lastName}` : '—'}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{paymentMethodLabels[inc.paymentMethod] || inc.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600">S/ {Number(inc.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4"><StatusBadge status={inc.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {incomes.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay ingresos registrados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900">Cuentas por Pagar (Egresos)</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-greenHover transition-colors">
                  <Plus className="w-3.5 h-3.5" />Nuevo Egreso
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Nro.</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Descripción</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Categoría</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Proveedor</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Doc. Tipo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Total</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-xs">{exp.number}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{exp.description?.substring(0, 50) || '—'}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{expenseCategoryLabels[exp.category] || exp.category}</span></td>
                        <td className="py-3 px-4 text-slate-600">{exp.vendorName || '—'}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{exp.docType}</td>
                        <td className="py-3 px-4 text-right font-semibold text-red-500">S/ {Number(exp.totalAmount || exp.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4"><StatusBadge status={exp.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenses.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay egresos registrados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900">Plan de Cuentas Contable</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-greenHover transition-colors">
                  <Plus className="w-3.5 h-3.5" />Nueva Cuenta
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Código</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Nombre</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Tipo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Subtipo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Saldo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{acc.code}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{acc.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            acc.type === 'ACTIVO' ? 'bg-blue-50 text-blue-600' :
                            acc.type === 'PASIVO' ? 'bg-orange-50 text-orange-600' :
                            acc.type === 'PATRIMONIO' ? 'bg-purple-50 text-purple-600' :
                            acc.type === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-red-50 text-red-600'
                          }`}>{acc.type}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{acc.subtype?.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">S/ {Number(acc.currentBalance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${acc.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {acc.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {accounts.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay cuentas contables configuradas</p>
                    <p className="text-xs text-slate-400 mt-1">Agrega las cuentas del plan contable para empezar a registrar asientos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Helper Components ───
function KpiCard({ title, value, color, icon, subtitle }: { title: string; value: number; color: string; icon: React.ReactNode; subtitle?: string }) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-white', text: 'text-blue-600', iconBg: 'bg-blue-50' },
    green: { bg: 'bg-white', text: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    red: { bg: 'bg-white', text: 'text-red-600', iconBg: 'bg-red-50' },
    amber: { bg: 'bg-white', text: 'text-amber-600', iconBg: 'bg-amber-50' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`${c.bg} rounded-xl border border-slate-100 p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium">{title}</p>
        <div className={`w-8 h-8 rounded-full ${c.iconBg} flex items-center justify-center ${c.text}`}>{icon}</div>
      </div>
      <p className={`text-xl font-bold ${value >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
        S/ {value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = statusLabels[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
}
