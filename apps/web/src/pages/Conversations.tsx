import { useState, useRef, useEffect } from 'react';
import { Search, Filter, Phone, Video, MoreVertical, Send, Paperclip, Smile, Check, CheckCheck, Bot, ArrowLeft, Image as ImageIcon, FileText, Camera, User, X, Zap } from 'lucide-react';
import { getChats, getChatMessages, sendChatMessage, toggleChatBot } from '../lib/api';

const formatTime = (date: Date | string) => {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
};

const QUICK_REPLIES = [
  { shortcut: '/precio', message: 'Los precios de {{proyecto}} comienzan desde {{precio_desde}}.' },
  { shortcut: '/ubicacion', message: 'Estamos ubicados en {{direccion_proyecto}}.' },
  { shortcut: '/saludo', message: '¡Hola! ¿En qué te puedo ayudar hoy?' },
];

export function Conversations() {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showQuickReplyManager, setShowQuickReplyManager] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    try {
      const res = await getChats();
      setChats(res.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await getChatMessages(chatId);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // In a real app, you'd set up a WebSocket or polling here
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      const interval = setInterval(() => fetchMessages(activeChatId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    if (text.endsWith('/')) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  };

  const handleQuickReplySelect = (qr: typeof QUICK_REPLIES[0]) => {
    const newText = inputText.slice(0, -1) + qr.message;
    setInputText(newText);
    setShowQuickReplies(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId) return;
    try {
      const text = inputText;
      setInputText('');
      await sendChatMessage(activeChatId, text);
      await fetchMessages(activeChatId);
      await fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleBot = async () => {
    if (!activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;
    
    try {
      await toggleChatBot(activeChatId, !chat.isBotActive);
      await fetchChats(); // Refresh chat list to update bot status
    } catch (error) {
      console.error('Error toggling bot:', error);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] bg-white overflow-hidden rounded-none md:rounded-2xl border-0 md:border border-slate-200 shadow-sm md:m-4 lg:m-8 animate-fade-in">
      
      {/* Sidebar de Chats */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/30 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Mensajes</h2>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-20">
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">Todos los mensajes</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">No leídos</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">Asignados a mí</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingChats ? (
             <div className="p-4 text-center text-sm text-slate-500">Cargando chats...</div>
          ) : chats.length === 0 ? (
             <div className="p-4 text-center text-sm text-slate-500">No hay conversaciones.</div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3 mx-2 my-1 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeChatId === chat.id ? 'bg-brand-green/10' : 'hover:bg-slate-100'}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${activeChatId === chat.id ? 'bg-brand-green text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {chat.contact?.firstName ? chat.contact.firstName[0].toUpperCase() : chat.phoneNumber.slice(-2)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-brand-green' : 'text-slate-900'}`}>
                      {chat.contact ? `${chat.contact.firstName} ${chat.contact.lastName}` : chat.phoneNumber}
                    </h3>
                    <span className={`text-[10px] whitespace-nowrap ${chat.unreadCount > 0 ? 'text-brand-green font-bold' : 'text-slate-400'}`}>
                      {formatTime(chat.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                      {chat.isBotActive ? '🤖 IA Activa' : '👤 Asesor'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="w-4 h-4 bg-brand-green text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de Chat Principal */}
      <div className={`flex-1 flex-col min-w-0 bg-[#efeae2] relative ${activeChatId ? 'flex' : 'hidden md:flex'}`}> 
        
        {activeChat ? (
          <>
            {/* Header del Chat */}
            <div className="px-4 md:px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                   {activeChat.contact?.firstName ? activeChat.contact.firstName[0].toUpperCase() : activeChat.phoneNumber.slice(-2)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeChat.contact ? `${activeChat.contact.firstName} ${activeChat.contact.lastName}` : activeChat.phoneNumber}
                  </h2>
                  <p className="text-xs text-brand-green font-medium">WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                  onClick={toggleBot}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors ${activeChat.isBotActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 hover:bg-slate-500'}`}
                >
                  <Bot className="w-4 h-4" />
                  {activeChat.isBotActive ? 'Bot Activo' : 'Bot Inactivo'}
                </button>
                <div className="hidden md:block h-6 w-px bg-slate-200"></div>
                <button className="text-slate-400 hover:text-slate-600"><Phone className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-slate-600"><Video className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
              <div className="flex justify-center mb-6">
                <span className="bg-white/80 backdrop-blur text-slate-500 text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider font-semibold shadow-sm">
                  Inicio de la conversación
                </span>
              </div>

              {messages.map((msg) => (
                <Message 
                  key={msg.id}
                  bubble={msg.content} 
                  time={formatTime(msg.timestamp)} 
                  isUser={!msg.isFromUser} // If it's NOT from the customer, it's from US (User of the CRM)
                  isBot={msg.isFromBot} 
                  status={msg.status}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0 relative">
              
              {/* Quick Replies Dropdown */}
              {showQuickReplies && (
                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="p-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Respuestas Rápidas</span>
                    <button onClick={() => setShowQuickReplyManager(true)} className="text-xs text-brand-green hover:underline">Administrar</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {QUICK_REPLIES.map((qr, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleQuickReplySelect(qr)}
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div className="text-sm font-semibold text-brand-green">{qr.shortcut}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{qr.message}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attach Dropdown */}
              {showAttach && (
                <div className="absolute bottom-full left-12 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Fotos y Videos</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Documento</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Cámara</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Contacto</span>
                  </button>
                </div>
              )}

              {/* Emoji Picker (Mock) */}
              {showEmojis && (
                <div className="absolute bottom-full left-4 mb-2 w-64 h-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4">
                  <div className="text-xs text-center text-slate-500 mt-20">Selector de Emojis<br/>(Requiere emoji-picker-react)</div>
                </div>
              )}

              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-brand-green/20 focus-within:border-brand-green transition-all shadow-sm">
                <div className="flex gap-1 pb-1">
                  <button 
                    onClick={() => setShowEmojis(!showEmojis)}
                    className={`p-2 rounded-full transition-colors ${showEmojis ? 'text-brand-green bg-brand-green/10' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowAttach(!showAttach)}
                    className={`p-2 rounded-full transition-colors ${showAttach ? 'text-brand-green bg-brand-green/10' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                
                <textarea 
                  ref={inputRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-3 px-2 text-sm focus:outline-none text-slate-700" 
                  placeholder="Escribe un mensaje... ('/' para respuestas rápidas)"
                  rows={1}
                />
                
                <button 
                  onClick={handleSendMessage}
                  className="p-3 bg-brand-green hover:bg-brand-greenHover text-white rounded-lg shadow-sm transition-colors mb-0.5"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2 hidden md:block">
                El <strong>Asistente IA</strong> está respondiendo automáticamente. Si envías un mensaje, el bot se pausará.
              </p>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <img src="/placeholder-chat.svg" alt="Chat" className="w-16 h-16 opacity-50" />
            </div>
            <h2 className="text-2xl font-light text-slate-700 mb-2">ChatPrex Web</h2>
            <p className="text-sm text-slate-500 max-w-sm">Envía y recibe mensajes sin mantener tu teléfono conectado. Selecciona un chat para comenzar.</p>
          </div>
        )}
      </div>

      {/* Modal Quick Replies */}
      {showQuickReplyManager && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-green" />
                <h2 className="text-lg font-semibold text-slate-900">Respuestas Rápidas</h2>
              </div>
              <button onClick={() => setShowQuickReplyManager(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {QUICK_REPLIES.map((qr, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-700">{qr.shortcut}</span>
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:underline">Editar</button>
                        <button className="text-xs text-red-600 hover:underline">Eliminar</button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{qr.message}</p>
                  </div>
                ))}
                <button className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-brand-green font-medium hover:bg-brand-green/5 transition-colors">
                  + Crear Nueva Respuesta Rápida
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Message({ bubble, time, isUser, isBot = false, status }: { bubble: string, time: string, isUser: boolean, isBot?: boolean, status?: string }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2 shadow-sm relative ${
          isUser 
            ? 'bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-tr-sm' 
            : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{bubble}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium px-1">
          {isBot && isUser && (
             <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-1">
               <Bot className="w-3 h-3" /> IA
             </span>
          )}
          {time}
          {isUser && status === 'SENT' && <Check className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
          {isUser && status === 'DELIVERED' && <CheckCheck className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
          {isUser && (status === 'READ' || !status) && <CheckCheck className="w-3.5 h-3.5 text-blue-500 ml-0.5" />}
        </div>
      </div>
    </div>
  );
}
