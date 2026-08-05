import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { NewTransactionModal } from '../components/modals/NewTransactionModal';
import { getTransactions } from '../lib/api';

export function Finances() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinances = async () => {
    try {
      setLoading(true);
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    activeTab === 'ALL' ? true : t.type === activeTab
  );

  // KPIs
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balanceTotal = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Finanzas y Flujo de Caja</h1>
          <p className="text-xs text-slate-500 mt-0.5">Controla los ingresos y egresos de tus proyectos</p>
        </div>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
             <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white shadow-sm text-slate-900">USD</button>
             <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-900">PEN</button>
          </div>
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Transacción
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Balance Total</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">${balanceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Ingresos Totales</h3>
            <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-brand-green" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-500 mt-2">{transactions.filter(t => t.type === 'INCOME').length} transacciones</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Egresos Totales</h3>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-500 mt-2">{transactions.filter(t => t.type === 'EXPENSE').length} transacciones</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
        
        {/* Tabs & Search */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setActiveTab('INCOME')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'INCOME' ? 'bg-white text-brand-green shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ingresos
            </button>
            <button 
              onClick={() => setActiveTab('EXPENSE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Egresos
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar transacción..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">Cargando finanzas...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Proyecto / Unidad</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-brand-green/10' : 'bg-red-50'}`}>
                          {tx.type === 'INCOME' 
                            ? <ArrowUpRight className="w-5 h-5 text-brand-green" /> 
                            : <ArrowDownRight className="w-5 h-5 text-red-500" />
                          }
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{tx.description || tx.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{tx.type === 'INCOME' ? 'Ingreso' : 'Egreso'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{tx.project?.name || '-'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{tx.property?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-semibold text-sm ${tx.type === 'INCOME' ? 'text-brand-green' : 'text-slate-900'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {tx.currency || 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'COMPLETED' ? 'bg-brand-green/10 text-brand-green' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-900">No hay transacciones</h3>
              <p className="text-xs text-slate-500 mt-1">No se encontraron registros financieros para esta vista.</p>
            </div>
          )}
        </div>
      </div>

      <NewTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFinances}
      />
    </div>
  );
}
