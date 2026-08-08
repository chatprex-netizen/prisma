import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bot, Plus, Sparkles, Save, FileText, Settings2, Zap, RefreshCw, UploadCloud, ChevronRight } from 'lucide-react';

export function AIAssistants() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'PERSONALIDAD' | 'MOTOR_IA' | 'CONOCIMIENTO' | 'AJUSTES_PRO'>('PERSONALIDAD');

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex gap-6 animate-fade-in">

      {/* Sidebar de Asistentes */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-green" />
            Asistentes IA
          </h2>
          <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">2</span>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
          {/* Bot Activo */}
          <button className="w-full flex items-center gap-3 p-3 bg-brand-green text-white rounded-xl shadow-md shadow-brand-green/20 text-left transition-transform hover:scale-[1.02]">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Asistente Recepcionista</h3>
              <p className="text-[10px] text-green-100 mt-0.5">OpenAI • gpt-4o-mini</p>
            </div>
          </button>

          {/* Nuevo Bot */}
          <button className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-brand-green hover:bg-brand-green/5 text-left transition-all group">
            <div className="w-10 h-10 bg-slate-50 group-hover:bg-brand-green/10 rounded-lg flex items-center justify-center shrink-0 transition-colors">
              <Plus className="w-5 h-5 text-slate-400 group-hover:text-brand-green" />
            </div>
            <div>
              <h3 className="text-sm font-semibold group-hover:text-brand-green transition-colors">Nuevo Bot</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Crear asistente en blanco</p>
            </div>
          </button>
        </div>
      </div>

      {/* Área Principal de Configuración */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-0 overflow-hidden">
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Asistente Recepcionista</h1>
              <p className="text-sm text-slate-500 mt-0.5">Configuración y personalidad del asistente virtual</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse"></span>
              Motor Activo
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="px-6 border-b border-slate-100 flex gap-6 bg-slate-50/50 shrink-0 overflow-x-auto custom-scrollbar">
          {[
            { id: 'PERSONALIDAD', icon: FileText, label: 'Personalidad' },
            { id: 'MOTOR_IA', icon: Sparkles, label: 'Motor IA' },
            { id: 'CONOCIMIENTO', icon: FileText, label: 'Conocimiento' },
            { id: 'AJUSTES_PRO', icon: Zap, label: 'Ajustes Pro' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">

          {/* TAB: Personalidad */}
          {activeTab === 'PERSONALIDAD' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Instrucciones de comportamiento</h3>
                  <p className="text-sm text-slate-500">Define la voz, tono y reglas de interacción del bot.</p>
                </div>
                <button className="text-sm text-slate-500 hover:text-brand-green font-medium flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
                  <RefreshCw className="w-4 h-4" />
                  Restaurar plantilla
                </button>
              </div>

              <textarea
                className="w-full h-96 p-5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 leading-relaxed font-mono resize-none shadow-sm"
                defaultValue={`# ROL Y CONTEXTO
Eres el "Asistente Recepcionista" de la inmobiliaria. Eres el primer punto de contacto. Tu tono debe ser amable, profesional y muy breve (máximo 2 oraciones).

# TU OBJETIVO PRINCIPAL
1. Saludar al cliente y darle la bienvenida.
2. Hacer máximo 2 preguntas para perfilar su interés (¿Qué tipo de propiedad busca? o ¿En qué proyecto está interesado?).
3. Derivar la conversación inmediatamente al especialista adecuado usando tus Herramientas (Tools).

# REGLAS ESTRICTAS DE DERIVACIÓN (Routing)
- Si el cliente menciona un proyecto específico (ej. "Torre Marina"), NO le des detalles de precios ni características. Llama a la función [transferir_conversacion] con el ID del bot de ese proyecto.
- Si el cliente pide hablar con un asesor o humano, se muestra frustrado o hace preguntas complejas (crédito hipotecario), llama a la función [transferir_humano].`}
              />

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-sm text-emerald-800">
                <InfoIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Tip:</strong> Incluya reglas de respuesta corta y un llamado a la acción claro para maximizar las conversiones de sus leads. La IA funciona mejor con instrucciones directas y en viñetas.</p>
              </div>
            </div>
          )}

          {/* TAB: Motor IA */}
          {activeTab === 'MOTOR_IA' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Proveedor de Inteligencia Artificial</h3>
                <p className="text-sm text-slate-500 mb-4">Selecciona la plataforma y el modelo que impulsará a este asistente.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* OpenAI */}
                  <label className="relative cursor-pointer">
                    <input type="radio" name="ai_provider" value="openai" className="peer sr-only" defaultChecked />
                    <div className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 peer-checked:border-brand-green peer-checked:bg-brand-green/5 transition-all text-center">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-slate-900">OpenAI</h4>
                      <p className="text-xs text-slate-500 mt-1">GPT-4, GPT-3.5</p>
                    </div>
                  </label>

                  {/* Anthropic */}
                  <label className="relative cursor-pointer">
                    <input type="radio" name="ai_provider" value="anthropic" className="peer sr-only" />
                    <div className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 peer-checked:border-brand-green peer-checked:bg-brand-green/5 transition-all text-center">
                      <div className="w-12 h-12 bg-[#D1C6B4] text-[#292723] rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="font-serif font-bold text-xl">A</span>
                      </div>
                      <h4 className="font-semibold text-slate-900">Anthropic</h4>
                      <p className="text-xs text-slate-500 mt-1">Claude 3.5 Sonnet</p>
                    </div>
                  </label>

                  {/* Google */}
                  <label className="relative cursor-pointer">
                    <input type="radio" name="ai_provider" value="google" className="peer sr-only" />
                    <div className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 peer-checked:border-brand-green peer-checked:bg-brand-green/5 transition-all text-center">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="font-bold text-xl">G</span>
                      </div>
                      <h4 className="font-semibold text-slate-900">Google</h4>
                      <p className="text-xs text-slate-500 mt-1">Gemini 1.5 Pro</p>
                    </div>
                  </label>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">API Key (Clave de acceso)</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                    />
                    <p className="text-xs text-slate-500 mt-1">Tu clave segura para conectarse al proveedor seleccionado.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Modelo específico</label>
                    <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white text-slate-700 font-medium">
                      <option value="gpt-4o-mini">gpt-4o-mini (Recomendado - Rápido y económico)</option>
                      <option value="gpt-4o">gpt-4o (Mayor inteligencia, más costoso)</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legado)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-slate-700">Temperatura: <span className="text-brand-green">0.7</span></label>
                    </div>
                    <input type="range" min="0" max="2" step="0.1" defaultValue="0.7" className="w-full accent-brand-green" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Preciso / Robótico</span>
                      <span>Creativo / Aleatorio</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-4">
                    <label className="block text-sm font-medium text-slate-700">Token Limit (Max Tokens)</label>
                    <input type="number" defaultValue={500} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" />
                    <p className="text-xs text-slate-500 mt-1">Límite de longitud para la respuesta del bot para ahorrar costos.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Conocimiento */}
          {activeTab === 'CONOCIMIENTO' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group shadow-sm">
                <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-brand-green" />
                </div>
                <h4 className="text-base font-semibold text-slate-900">Base de conocimiento</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  La IA consultará esta información antes de responder. Inserte catálogos (PDF), listas de precios (CSV), manuales o preguntas frecuentes.
                </p>
                <button className="mt-6 px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  Subir Archivo
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Contexto inyectado manualmente</h4>
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 leading-relaxed font-mono resize-none shadow-sm"
                  placeholder="Escriba aquí datos rápidos que la IA deba saber de memoria..."
                  defaultValue={`Proyecto: Torre Marina\nPrecios: Desde $85,000 USD\nEntrega: Inmediata\nCuota Inicial: 10%\n\nPregunta Frecuente: ¿Tienen cochera?\nRespuesta: Sí, el costo adicional es de $12,000 USD.`}
                />
              </div>
            </div>
          )}

          {/* TAB: Ajustes Pro */}
          {activeTab === 'AJUSTES_PRO' && (
            <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingToggle
                title="Transcripción de audios"
                description="Convierte notas de voz entrantes de WhatsApp a texto y las procesa con IA automáticamente."
                defaultChecked={true}
              />
              <SettingToggle
                title="Agrupación inteligente"
                description="Espera 5 segundos para agrupar mensajes consecutivos del cliente en una sola consulta a la IA."
                defaultChecked={true}
              />
              <SettingToggle
                title="Escritura humanizada"
                description="Simula el tiempo de escritura (Typing...) y envía mensajes fragmentados en lugar de bloques de texto gigantes."
                defaultChecked={false}
              />
              <SettingToggle
                title="Intervención de agente"
                description="Pausa el bot inmediatamente si el cliente solicita explícitamente hablar con un humano."
                defaultChecked={true}
              />
              <SettingToggle
                title="Convertir en Orquestador"
                description="Delega conversaciones a otros Bots subordinados automáticamente según la intención del cliente."
                defaultChecked={false}
              />

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm mt-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Palabras clave de activación (Opcional)</h4>
                <p className="text-xs text-slate-500 mb-3">El bot se activará solo al detectar estos términos exactos en el chat. Déjalo en blanco para responder a todo.</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  placeholder="Ej: info, cotización, proyecto..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, defaultChecked }: { title: string, description: string, defaultChecked: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setEnabled(!enabled)}>
      <div className="pr-8">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-brand-green' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'left-6' : 'left-1'}`}></div>
      </div>
    </div>
  );
}

function InfoIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
