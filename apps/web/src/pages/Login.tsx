import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../lib/api';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        login(data.token, data.user);
        navigate('/');
      } else {
        const data = await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, firstName, lastName }),
        });
        login(data.token, data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">
      {/* Left side (Dark) */}
      <div className="hidden md:flex md:w-1/2 bg-brand-dark flex-col justify-center px-16 relative">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-brand-green flex items-center justify-center text-white font-bold text-xs tracking-wide">
            IN
          </div>
          <span className="text-white font-semibold text-sm">Inmobiliaria CRM</span>
        </div>
        
        <div className="max-w-md mt-[-10vh]">
          <h1 className="text-3xl font-semibold text-white tracking-tight leading-tight mb-4">
            Todo tu embudo inmobiliario en una sola vista
          </h1>
          <p className="text-sm text-slate-400">
            Proyectos, unidades, oportunidades, agenda y contratos conectados para que tu equipo comercial cierre más rápido.
          </p>
        </div>

        <div className="absolute bottom-8 left-8">
          <p className="text-[10px] text-slate-500">Perú · Gestión de preventa y entrega</p>
        </div>
      </div>

      {/* Right side (Form) */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Bienvenido</h2>
          <p className="text-xs text-slate-500 mb-8">Accede con tu cuenta corporativa.</p>

          <button className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-6 shadow-sm flex items-center justify-center gap-2">
            Continuar con Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] text-slate-400">o con tu correo</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="bg-slate-50 p-1 rounded-lg flex mb-6 border border-slate-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${isLogin ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ingresar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${!isLogin ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Crear cuenta
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Nombre</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Apellido</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Correo</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Contraseña</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 mt-2 rounded-lg bg-brand-green text-white text-sm font-semibold hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/30 disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
