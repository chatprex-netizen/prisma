import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Building, Palette, Link2, Bell, Shield, Upload, Save, MessageCircle, CheckCircle2, XCircle, Eye, EyeOff, ChevronDown, ChevronUp, ExternalLink, Wifi, WifiOff, Loader2, PieChart as PieIcon, Plus } from 'lucide-react';
import { getLeadSources, createLeadSource, updateLeadSource, deleteLeadSource, getPipelineStages, updatePipelineStage } from '../lib/api';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type TabType = 'perfil' | 'empresa' | 'apariencia' | 'whatsapp' | 'integraciones' | 'seguridad' | 'origenes' | 'etapas';

// WhatsApp Connection Tab Component
function WhatsAppConnectionTab() {
  const [waCreds, setWaCreds] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookToken: '',
    pin: ''
  });
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; phoneNumber?: string; businessName?: string } | null>(null);

  const isConfigured = waCreds.phoneNumberId && waCreds.wabaId && waCreds.accessToken && waCreds.webhookToken;

  // Load existing credentials on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/settings/whatsapp`);
        const json = await res.json();
        if (json.success && json.data) {
          setWaCreds(prev => ({
            ...prev,
            phoneNumberId: json.data.WA_PHONE_NUMBER_ID || '',
            wabaId: json.data.WA_WABA_ID || '',
            accessToken: '', // Never pre-fill the full token for security
            webhookToken: json.data.WA_WEBHOOK_TOKEN || '',
            pin: json.data.WA_PIN || '',
          }));
          setConnected(json.isConfigured);
        }
      } catch { /* DB may not be running yet */ }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!isConfigured) {
      alert('Por favor completa todos los campos obligatorios: Phone Number ID, WABA ID, Access Token y Webhook Token.');
      return;
    }
    if (!window.confirm('¿Confirmas que deseas guardar y aplicar las credenciales de WhatsApp Business API?')) return;

    setSaving(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API}/settings/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waCreds),
      });
      const json = await res.json();
      if (json.success) {
        setConnected(true);
        alert('✅ ' + json.message);
      } else {
        alert('❌ Error: ' + json.error);
      }
    } catch (err: any) {
      alert('❌ Error de red: ' + err.message);
    }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API}/settings/whatsapp/test`, { method: 'POST' });
      const json = await res.json();
      setTestResult({
        success: json.success,
        message: json.message || json.error,
        phoneNumber: json.phoneNumber,
        businessName: json.businessName,
      });
    } catch (err: any) {
      setTestResult({ success: false, message: 'Error de red: ' + err.message });
    }
    setTesting(false);
  };

  const steps = [
    {
      id: 1,
      title: 'Crear una meta-aplicación',
      content: 'Ve a developers.facebook.com → "Mis Apps" → "Crear App". Selecciona el tipo "Empresa" y sigue el asistente de configuración hasta completar el registro.'
    },
    {
      id: 2,
      title: 'Agregar producto de WhatsApp',
      content: 'Dentro de tu aplicación Meta, ve al Panel de Productos. Busca "WhatsApp" y haz clic en "Configurar". Esto agregará WhatsApp Business API a tu aplicación.'
    },
    {
      id: 3,
      title: 'Obtener credenciales API',
      content: 'En la sección de WhatsApp → Configuración de API: copia el "ID de número de teléfono" y el "Token de acceso temporal" (o genera uno permanente). El "ID de cuenta de WhatsApp Business" (WABA ID) está en el panel principal de la app.'
    },
    {
      id: 4,
      title: 'Configurar webhooks',
      content: `En WhatsApp → Configuración → Webhooks: ingresa la URL del webhook de tu CRM:\n\nhttps://tu-dominio.com/api/webhooks/whatsapp\n\nUsa como "Token de verificación" el mismo valor que ingreses abajo en el campo "Token de verificación de webhook".`
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5" />
        Conexión WhatsApp Business API
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Credentials Form */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Connection Status Banner */}
          <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
            connected 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {connected 
              ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
              : <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            }
            <div>
              <p className="text-sm font-semibold">{connected ? 'Conectado' : 'No conectado'}</p>
              <p className="text-xs mt-0.5">
                {connected 
                  ? 'Tu cuenta de WhatsApp Business API está activa y recibiendo mensajes.'
                  : 'Configure sus credenciales de Meta API a continuación para conectar su cuenta de WhatsApp Business.'}
              </p>
            </div>
          </div>

          {/* API Credentials Card */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Credenciales API</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ingrese sus credenciales de Meta WhatsApp Business API.</p>
            </div>

            {/* Phone Number ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Identificación del número de teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={waCreds.phoneNumberId}
                onChange={e => setWaCreds({...waCreds, phoneNumberId: e.target.value})}
                placeholder="e.g. 100234567890123"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>

            {/* WABA ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                ID de cuenta empresarial de WhatsApp (WABA ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={waCreds.wabaId}
                onChange={e => setWaCreds({...waCreds, wabaId: e.target.value})}
                placeholder="e.g. chatprex@gmail.com o ID numérico"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>

            {/* Access Token */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Token de acceso permanente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={waCreds.accessToken}
                  onChange={e => setWaCreds({...waCreds, accessToken: e.target.value})}
                  placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Verify Token */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Token de verificación de webhook <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={waCreds.webhookToken}
                onChange={e => setWaCreds({...waCreds, webhookToken: e.target.value})}
                placeholder="Crear un token de verificación personalizado"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
              <p className="text-[10px] text-slate-400">Una cadena personalizada que usted crea. Debe coincidir con el token que configuró en la configuración del meta webhook.</p>
            </div>

            {/* 2FA PIN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                PIN de verificación en dos pasos <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="password"
                value={waCreds.pin}
                onChange={e => setWaCreds({...waCreds, pin: e.target.value})}
                placeholder="PIN de 6 dígitos de Meta WhatsApp Manager"
                maxLength={6}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all tracking-widest font-mono"
              />
            </div>
          </div>

          {/* Webhook URL Info */}
          <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider">URL de Webhook (para Meta)</h4>
            <p className="text-xs text-blue-700">Copia esta URL en la configuración de tu aplicación Meta:</p>
            <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <code className="text-xs text-slate-700 flex-1 break-all">
                {window.location.hostname === 'localhost' 
                  ? 'https://tu-dominio.com/api/webhooks/whatsapp'
                  : `https://${window.location.hostname}/api/webhooks/whatsapp`}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText('https://tu-dominio.com/api/webhooks/whatsapp')}
                className="text-[10px] text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors shrink-0"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : 'Guardar Credenciales'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing || !connected}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              title={!connected ? 'Guarda las credenciales primero' : 'Probar conexión con Meta API'}
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
              {testing ? 'Probando...' : 'Probar Conexión'}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
              testResult.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {testResult.success
                ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                : <WifiOff className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              }
              <div>
                <p className="text-sm font-semibold">{testResult.message}</p>
                {testResult.phoneNumber && (
                  <p className="text-xs mt-1">📱 Número: <span className="font-mono font-medium">{testResult.phoneNumber}</span></p>
                )}
                {testResult.businessName && (
                  <p className="text-xs">🏢 Nombre verificado: <span className="font-medium">{testResult.businessName}</span></p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Setup Instructions */}
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Instrucciones de configuración</h3>
            <p className="text-xs text-slate-500 mb-4">Siga estos pasos para conectar su API de WhatsApp Business.</p>

            <div className="space-y-2">
              {steps.map((step) => (
                <div key={step.id} className="border border-slate-200 bg-white rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                      {step.id}
                    </span>
                    <span className="text-xs font-medium text-slate-800 flex-1">{step.title}</span>
                    {expandedStep === step.id
                      ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    }
                  </button>
                  {expandedStep === step.id && (
                    <div className="px-4 pb-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-3">
                      {step.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 mt-4 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Documentación oficial de la Meta API de WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Ajustes del Sistema</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configura y personaliza tu entorno de trabajo. Elige una sección para gestionarla.</p>
        </div>
        <button className="bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-green/20 w-full md:w-auto justify-center">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        {/* Sidebar Settings */}
        <div className="w-full md:w-56 shrink-0 space-y-0.5 overflow-y-auto custom-scrollbar">
          {[
            { id: 'perfil', icon: User, label: 'Mi Perfil' },
            { id: 'empresa', icon: Building, label: 'Empresa y Moneda' },
            { id: 'apariencia', icon: Palette, label: 'Apariencia' },
            { id: 'whatsapp', icon: MessageCircle, label: 'Conexión WhatsApp', badge: 'NUEVO' },
            { id: 'integraciones', icon: Link2, label: 'Integraciones' },
            { id: 'seguridad', icon: Shield, label: 'Seguridad y Permisos' },
            { id: 'origenes', icon: PieIcon, label: 'Orígenes de Leads' },
            { id: 'etapas', icon: SettingsIcon, label: 'Etapas de Pipeline' },
          ].map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id ? 'bg-slate-100 text-brand-green' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-y-auto custom-scrollbar">
          
          {/* TAB: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Información Personal</h2>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <Upload className="w-6 h-6 group-hover:text-brand-green" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Foto de Perfil</h3>
                  <p className="text-xs text-slate-500 mb-3">JPG, GIF o PNG. Tamaño máximo de 1MB.</p>
                  <button className="text-xs font-medium text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-md hover:bg-brand-green/20 transition-colors">
                    Subir nueva foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Nombre</label>
                  <input type="text" defaultValue="Carlos" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Apellido</label>
                  <input type="text" defaultValue="Mendoza" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Correo Electrónico</label>
                  <input type="email" defaultValue="carlos.mendoza@inmobiliaria.com" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-slate-50" readOnly />
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMPRESA */}
          {activeTab === 'empresa' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Configuración de la Empresa</h2>
              
              <div className="flex items-center gap-6">
                <div className="w-32 h-16 rounded bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <span className="text-xs font-medium">Subir Logo</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Logo del Workspace</h3>
                  <p className="text-xs text-slate-500 mb-3">Este logo aparecerá en la barra lateral y en los PDF generados.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Nombre de la Inmobiliaria</label>
                  <input type="text" defaultValue="ChatPrex Inmobiliario" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Moneda por Defecto</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white cursor-pointer">
                    <option value="PEN">Soles (PEN - S/)</option>
                    <option value="USD">Dólares Estadounidenses (USD - $)</option>
                    <option value="EUR">Euros (EUR - €)</option>
                    <option value="MXN">Pesos Mexicanos (MXN - $)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Zona Horaria</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white cursor-pointer">
                    <option value="America/Lima">(GMT-05:00) Lima</option>
                    <option value="America/Bogota">(GMT-05:00) Bogotá</option>
                    <option value="America/Mexico_City">(GMT-06:00) Ciudad de México</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APARIENCIA */}
          {activeTab === 'apariencia' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Apariencia y Tema</h2>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Tema del Sistema</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-brand-green bg-slate-50 rounded-xl p-4 cursor-pointer relative">
                    <div className="absolute top-2 right-2 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div className="w-full h-20 bg-white rounded-md shadow-sm border border-slate-200 flex p-2 mb-2">
                      <div className="w-1/4 h-full bg-slate-100 rounded mr-2"></div>
                      <div className="w-3/4 h-full bg-slate-50 rounded border border-slate-100"></div>
                    </div>
                    <p className="text-xs font-medium text-center text-brand-green">Claro (Predeterminado)</p>
                  </div>
                  
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 cursor-pointer hover:border-slate-300 transition-colors">
                    <div className="w-full h-20 bg-slate-900 rounded-md shadow-sm border border-slate-800 flex p-2 mb-2">
                      <div className="w-1/4 h-full bg-slate-800 rounded mr-2"></div>
                      <div className="w-3/4 h-full bg-slate-800 rounded border border-slate-700"></div>
                    </div>
                    <p className="text-xs font-medium text-center text-slate-600">Oscuro (Próximamente)</p>
                  </div>
                  
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 cursor-pointer hover:border-slate-300 transition-colors flex items-center justify-center">
                    <p className="text-xs font-medium text-slate-500">Auto (Sistema)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP */}
          {activeTab === 'whatsapp' && <WhatsAppConnectionTab />}

          {/* TAB: INTEGRACIONES */}
          {activeTab === 'integraciones' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Integraciones de Terceros</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Whatsapp */}
                <div className="border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">WhatsApp Business API</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Conecta tu número oficial para enviar notificaciones y mensajes desde el CRM.</p>
                    <button
                      onClick={() => setActiveTab('whatsapp')}
                      className="text-xs font-medium bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Configurar WhatsApp →
                    </button>
                  </div>
                </div>

                {/* Google Calendar */}
                <div className="border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">Google Calendar</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Sincroniza tus citas de la agenda de ChatPrex con tu calendario de Google.</p>
                    <button className="text-xs font-medium bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                      Conectar
                    </button>
                  </div>
                </div>

                {/* Mailchimp */}
                <div className="border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FFE01B] rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">Mailchimp</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Sincroniza automáticamente tus contactos y prospectos para campañas de email.</p>
                    <button className="text-xs font-medium border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Seguridad y Permisos</h2>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Cambiar Contraseña</h3>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Contraseña Actual</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Nueva Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Confirmar Nueva Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                  </div>
                </div>
                <button className="text-xs font-medium text-brand-green bg-brand-green/10 px-4 py-2 rounded-lg hover:bg-brand-green/20 transition-colors">
                  Actualizar Contraseña
                </button>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Autenticación de Dos Pasos (2FA)</h3>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Protege tu cuenta</p>
                    <p className="text-xs text-slate-500 mt-0.5">Añade una capa extra de seguridad usando una app autenticadora.</p>
                  </div>
                  <button className="text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    Activar 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORIGENES */}
          {activeTab === 'origenes' && (
            <LeadSourcesTab />
          )}

          {/* TAB: ETAPAS */}
          {activeTab === 'etapas' && (
            <PipelineStagesTab />
          )}

        </div>
      </div>
    </div>
  );
}

function LeadSourcesTab() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const loadSources = async () => {
    try {
      setLoading(true);
      const res = await getLeadSources();
      setSources(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createLeadSource({ name: newName.trim(), color: newColor });
      setNewName('');
      setNewColor('#3b82f6');
      loadSources();
    } catch (err: any) {
      alert(err.message || 'Error al agregar origen');
    }
  };

  const handleStartEdit = (src: any) => {
    setEditingId(src.id);
    setEditName(src.name);
    setEditColor(src.color);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateLeadSource(id, { name: editName.trim(), color: editColor });
      setEditingId(null);
      loadSources();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Confirmas que deseas eliminar este origen?')) return;
    try {
      await deleteLeadSource(id);
      loadSources();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Orígenes de Leads</h2>
        <p className="text-xs text-slate-500 mt-1">Configura y gestiona las fuentes u orígenes desde donde llegan tus leads (ej. campañas, portales, referidos).</p>
      </div>

      {/* Formulario Agregar */}
      <form onSubmit={handleAdd} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-end gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Nombre de la Fuente</label>
          <input 
            type="text" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            placeholder="Ej. Facebook Ads, TikTok Orgánico" 
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white"
            required
          />
        </div>
        <div className="space-y-1.5 shrink-0">
          <label className="block text-xs font-semibold text-slate-700">Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={newColor} 
              onChange={e => setNewColor(e.target.value)} 
              className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="bg-brand-green hover:bg-brand-greenHover text-white p-2 md:px-4 md:py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Agregar</span>
        </button>
      </form>

      {/* Listado */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200/60 font-semibold text-xs text-slate-500 uppercase tracking-wider">
          Fuentes de lead activas
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Cargando orígenes...</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No hay orígenes registrados. Agrega uno arriba.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sources.map(src => (
              <div key={src.id} className="p-3.5 flex items-center justify-between gap-4">
                {editingId === src.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input 
                      type="color" 
                      value={editColor} 
                      onChange={e => setEditColor(e.target.value)} 
                      className="w-7 h-7 rounded cursor-pointer border border-slate-200 p-0.5"
                    />
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      className="flex-1 px-3 py-1 rounded border border-slate-200 text-sm focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                    />
                    <button 
                      onClick={() => handleSaveEdit(src.id)}
                      className="text-xs bg-brand-green text-white px-3 py-1 rounded hover:bg-brand-greenHover"
                    >
                      Guardar
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded hover:bg-slate-300"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: src.color }} />
                      <span className="text-sm font-semibold text-slate-800">{src.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStartEdit(src)}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(src.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineStagesTab() {
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<any[]>([]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const res = await getPipelineStages();
      setStages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleFieldChange = (index: number, field: string, value: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      for (const stage of stages) {
        await updatePipelineStage(stage.id, {
          name: stage.name,
          details: stage.details,
          color: stage.color,
          isVisible: stage.isVisible
        });
      }
      alert('Configuración de etapas guardada con éxito.');
    } catch (error) {
      console.error(error);
      alert('Error al guardar la configuración de etapas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Gestión de Etapas del Pipeline</h2>
          <p className="text-xxs text-slate-500 mt-0.5">Configura nombres, descripciones, colores y visibilidad de las etapas de tu embudo de ventas.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-brand-green hover:bg-brand-greenHover text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm shadow-brand-green/20 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {loading ? 'Guardando...' : 'Guardar Etapas'}
        </button>
      </div>

      <div className="space-y-3 max-w-4xl">
        {loading && stages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Cargando etapas...</div>
        ) : (
          <div className="space-y-2">
            {stages.map((stage, idx) => (
              <div key={stage.id} className="p-3 bg-slate-50/50 hover:bg-slate-100/10 rounded-xl border border-slate-200/60 flex items-center gap-4 transition-colors bg-white">
                {/* Color Picker (Stylized circle) */}
                <div className="relative shrink-0 flex items-center">
                  <input 
                    type="color" 
                    value={stage.color || '#64748b'} 
                    onChange={e => handleFieldChange(idx, 'color', e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Elegir color de la etapa"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-slate-300 shadow-inner cursor-pointer"
                    style={{ backgroundColor: stage.color || '#64748b' }}
                  />
                </div>

                {/* Custom Name */}
                <div className="w-1/4 min-w-0">
                  <input 
                    type="text" 
                    value={stage.name}
                    onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                    placeholder="Nombre de etapa"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/15 bg-white font-bold text-slate-800"
                  />
                </div>

                {/* Details / Description */}
                <div className="flex-1 min-w-0">
                  <input 
                    type="text" 
                    value={stage.details || ''}
                    onChange={e => handleFieldChange(idx, 'details', e.target.value)}
                    placeholder="Detalle o descripción..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/15 bg-white text-slate-500 font-medium"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleFieldChange(idx, 'isVisible', !stage.isVisible)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xxs font-bold border transition-all ${
                      stage.isVisible 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {stage.isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Oculto
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
