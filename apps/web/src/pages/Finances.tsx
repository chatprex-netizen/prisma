import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Receipt, BookOpen, Plus, Search, DollarSign, ChevronRight, Trash2, Edit } from 'lucide-react';
import { getIncomes, getExpenses, getAccounts, deleteIncome, deleteExpense, deleteAccount, getCompanyConfig } from '../lib/api';
import { NewIncomeModal } from '../components/modals/NewIncomeModal';
import { NewExpenseModal } from '../components/modals/NewExpenseModal';
import { NewAccountModal } from '../components/modals/NewAccountModal';

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
  const { user } = useAuth();

  if (user?.role !== 'ADMIN' && user?.role !== 'GERENTE_COMERCIAL') {
    return <Navigate to="/" replace />;
  }

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
  const [exchangeRate, setExchangeRate] = useState<number>(3.75);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('PEN');

  // Modals visibility and edit states
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inc, exp, acc, company] = await Promise.allSettled([
        getIncomes(),
        getExpenses(),
        getAccounts(),
        getCompanyConfig()
      ]);
      if (inc.status === 'fulfilled') setIncomes(Array.isArray(inc.value) ? inc.value : []);
      if (exp.status === 'fulfilled') setExpenses(Array.isArray(exp.value) ? exp.value : []);
      if (acc.status === 'fulfilled') setAccounts(Array.isArray(acc.value) ? acc.value : []);
      if (company.status === 'fulfilled' && company.value?.success && company.value?.data) {
        setExchangeRate(company.value.data.exchangeRate || 3.75);
        setDefaultCurrency(company.value.data.defaultCurrency || 'PEN');
      }
    } catch (err) {
      console.error('Error loading finances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    const confirmText = window.prompt('¡ADVERTENCIA! Esta acción afectará los reportes financieros. Para confirmar la eliminación de este ingreso, escribe "ELIMINAR":');
    if (confirmText !== 'ELIMINAR') return;
    try {
      await deleteIncome(id);
      loadAll();
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el ingreso');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const confirmText = window.prompt('¡ADVERTENCIA! Esta acción afectará los reportes financieros. Para confirmar la eliminación de este egreso, escribe "ELIMINAR":');
    if (confirmText !== 'ELIMINAR') return;
    try {
      await deleteExpense(id);
      loadAll();
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el egreso');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const confirmText = window.prompt('¡ADVERTENCIA! Esta acción puede alterar la integridad del plan contable. Para confirmar la eliminación de esta cuenta, escribe "ELIMINAR":');
    if (confirmText !== 'ELIMINAR') return;
    try {
      await deleteAccount(id);
      loadAll();
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar la cuenta contable');
    }
  };

  const convertToPen = (amount: number, currency: string) => {
    if (currency === 'USD') return amount * exchangeRate;
    if (currency === 'EUR') return amount * (exchangeRate * 1.1);
    return amount;
  };

  const convertToUsd = (amount: number, currency: string) => {
    if (currency === 'PEN') return amount / exchangeRate;
    if (currency === 'EUR') return amount * 1.1;
    return amount;
  };

  // PEN totals
  const totalIncomesPen = incomes.reduce((sum, i) => sum + convertToPen(Number(i.amount || 0), i.currency || 'PEN'), 0);
  const totalExpensesPen = expenses.reduce((sum, e) => sum + convertToPen(Number(e.totalAmount || e.amount || 0), e.currency || 'PEN'), 0);
  const balancePen = totalIncomesPen - totalExpensesPen;
  const pendingIncomesPen = incomes.filter(i => i.status === 'PENDIENTE').reduce((sum, i) => sum + convertToPen(Number(i.amount || 0), i.currency || 'PEN'), 0);
  const pendingExpensesPen = expenses.filter(e => e.status === 'PENDIENTE').reduce((sum, e) => sum + convertToPen(Number(e.totalAmount || e.amount || 0), e.currency || 'PEN'), 0);

  // USD totals
  const totalIncomesUsd = incomes.reduce((sum, i) => sum + convertToUsd(Number(i.amount || 0), i.currency || 'PEN'), 0);
  const totalExpensesUsd = expenses.reduce((sum, e) => sum + convertToUsd(Number(e.totalAmount || e.amount || 0), e.currency || 'PEN'), 0);
  const balanceUsd = totalIncomesUsd - totalExpensesUsd;
  const pendingIncomesUsd = incomes.filter(i => i.status === 'PENDIENTE').reduce((sum, i) => sum + convertToUsd(Number(i.amount || 0), i.currency || 'PEN'), 0);
  const pendingExpensesUsd = expenses.filter(e => e.status === 'PENDIENTE').reduce((sum, e) => sum + convertToUsd(Number(e.totalAmount || e.amount || 0), e.currency || 'PEN'), 0);

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
                <KpiCard title="Balance Total" valuePen={balancePen} valueUsd={balanceUsd} color="blue" icon={<Wallet className="w-4 h-4" />} />
                <KpiCard title="Total Ingresos" valuePen={totalIncomesPen} valueUsd={totalIncomesUsd} color="green" icon={<ArrowUpRight className="w-4 h-4" />} subtitle={`${incomes.length} registros`} />
                <KpiCard title="Total Egresos" valuePen={totalExpensesPen} valueUsd={totalExpensesUsd} color="red" icon={<ArrowDownRight className="w-4 h-4" />} subtitle={`${expenses.length} registros`} />
                <KpiCard title="Por Cobrar" valuePen={pendingIncomesPen} valueUsd={pendingIncomesUsd} color="amber" icon={<Receipt className="w-4 h-4" />} subtitle={`${incomes.filter(i => i.status === 'PENDIENTE').length} pendientes`} />
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
                          <p className="text-sm font-semibold text-emerald-600">+{inc.currency === 'USD' ? '$' : inc.currency === 'EUR' ? '€' : 'S/'} {Number(inc.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
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
                          <p className="text-sm font-semibold text-red-500">-{exp.currency === 'USD' ? '$' : exp.currency === 'EUR' ? '€' : 'S/'} {Number(exp.totalAmount || exp.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
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
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden text-left">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Cuentas por Cobrar (Ingresos)</h3>
                <button 
                  onClick={() => { setEditingIncome(null); setIsIncomeModalOpen(true); }}
                  className="flex items-center gap-1.5 p-1.5 md:px-3 md:py-1.5 rounded-lg bg-brand-green text-white text-xs font-bold hover:bg-brand-greenHover transition-colors shrink-0 shadow-sm shadow-brand-green/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Nuevo Ingreso</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Nro.</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Descripción</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Cliente</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Método</th>
                      <th className="text-right py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Monto</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                      <th className="text-center py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incomes.map(inc => (
                      <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">{inc.number}</td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">{new Date(inc.date).toLocaleDateString('es-PE')}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 text-xs">{inc.description?.substring(0, 50) || '—'}</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">{incomeTypeLabels[inc.type] || inc.type}</span></td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{inc.contact ? `${inc.contact.firstName} ${inc.contact.lastName || ''}` : '—'}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{paymentMethodLabels[inc.paymentMethod] || inc.paymentMethod}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">{inc.currency === 'USD' ? '$' : inc.currency === 'EUR' ? '€' : 'S/'} {Number(inc.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3"><StatusBadge status={inc.status} /></td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { setEditingIncome(inc); setIsIncomeModalOpen(true); }}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Editar Ingreso"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteIncome(inc.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar Ingreso"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
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
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden text-left">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Cuentas por Pagar (Egresos)</h3>
                <button 
                  onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}
                  className="flex items-center gap-1.5 p-1.5 md:px-3 md:py-1.5 rounded-lg bg-brand-green text-white text-xs font-bold hover:bg-brand-greenHover transition-colors shrink-0 shadow-sm shadow-brand-green/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Nuevo Egreso</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Nro.</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Descripción</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Categoría</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Proveedor</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Doc. Tipo</th>
                      <th className="text-right py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Total</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                      <th className="text-center py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">{exp.number}</td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">{new Date(exp.date).toLocaleDateString('es-PE')}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 text-xs">{exp.description?.substring(0, 50) || '—'}</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{expenseCategoryLabels[exp.category] || exp.category}</span></td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{exp.vendorName || '—'}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{exp.docType}</td>
                        <td className="py-2 px-3 text-right font-bold text-red-500">{exp.currency === 'USD' ? '$' : exp.currency === 'EUR' ? '€' : 'S/'} {Number(exp.totalAmount || exp.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3"><StatusBadge status={exp.status} /></td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { setEditingExpense(exp); setIsExpenseModalOpen(true); }}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Editar Egreso"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar Egreso"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
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
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden text-left">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Plan de Cuentas Contable</h3>
                <button 
                  onClick={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
                  className="flex items-center gap-1.5 p-1.5 md:px-3 md:py-1.5 rounded-lg bg-brand-green text-white text-xs font-bold hover:bg-brand-greenHover transition-colors shrink-0 shadow-sm shadow-brand-green/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Nueva Cuenta</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Código</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Subtipo</th>
                      <th className="text-right py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Saldo</th>
                      <th className="text-left py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                      <th className="text-center py-2 px-3 text-xxs font-bold uppercase tracking-wider text-slate-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{acc.code}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 text-xs">{acc.name}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.type === 'ACTIVO' ? 'bg-blue-50 text-blue-600' :
                            acc.type === 'PASIVO' ? 'bg-orange-50 text-orange-600' :
                            acc.type === 'PATRIMONIO' ? 'bg-purple-50 text-purple-600' :
                            acc.type === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-red-50 text-red-650'
                          }`}>{acc.type}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{acc.subtype?.replace(/_/g, ' ')}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">S/ {Number(acc.currentBalance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${acc.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {acc.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { setEditingAccount(acc); setIsAccountModalOpen(true); }}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Editar Cuenta"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar Cuenta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      <NewIncomeModal 
        isOpen={isIncomeModalOpen}
        onClose={() => { setIsIncomeModalOpen(false); setEditingIncome(null); }}
        onSuccess={loadAll}
        initialData={editingIncome}
      />

      <NewExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}
        onSuccess={loadAll}
        initialData={editingExpense}
      />

      <NewAccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => { setIsAccountModalOpen(false); setEditingAccount(null); }}
        onSuccess={loadAll}
        initialData={editingAccount}
      />
    </div>
  );
}

// ─── Helper Components ───
function KpiCard({ title, valuePen, valueUsd, color, icon, subtitle }: { title: string; valuePen: number; valueUsd: number; color: string; icon: React.ReactNode; subtitle?: string }) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-white border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-50/50' },
    green: { bg: 'bg-white border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-50/50' },
    red: { bg: 'bg-white border-red-100', text: 'text-red-655', iconBg: 'bg-red-50/50' },
    amber: { bg: 'bg-white border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-50/50' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`${c.bg} rounded-xl border p-3 shadow-xs hover:shadow-sm transition-all text-left`}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{title}</p>
        <div className={`w-7 h-7 rounded-full ${c.iconBg} flex items-center justify-center ${c.text}`}>{icon}</div>
      </div>
      <div className="space-y-0.5">
        <p className={`text-sm sm:text-base font-bold leading-tight ${valuePen >= 0 ? 'text-slate-900' : 'text-red-655'}`}>
          S/ {valuePen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-slate-500 font-medium">
          $ {valueUsd.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = statusLabels[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
}
