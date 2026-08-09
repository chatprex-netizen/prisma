import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Trash2, X, Check, Loader2, Download } from 'lucide-react';
import { uploadDocument, getDocuments } from '../../lib/api';

interface DocumentListProps {
  contactId?: string;
  propertyId?: string;
  title?: string;
}

export default function DocumentList({ contactId, propertyId, title = "Documentos" }: DocumentListProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  }, [contactId, propertyId]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await getDocuments(contactId, propertyId);
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo no puede pesar más de 10MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('type', file.type.startsWith('image/') ? 'FOTO' : 'DOCUMENTO');
      if (contactId) formData.append('contactId', contactId);
      if (propertyId) formData.append('propertyId', propertyId);

      await uploadDocument(formData);
      await fetchDocs();
    } catch (err: any) {
      alert("Error al subir archivo: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined' && window.location.hostname.includes('prexup.com')) {
      return 'https://api.prexup.com';
    }
    return 'http://localhost:3001';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 bg-brand-green text-white text-xs font-medium rounded-lg hover:bg-brand-green/90 transition-colors flex items-center gap-2"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Subir
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf,.doc,.docx"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-[150px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <FileText className="w-8 h-8 opacity-20" />
            <p className="text-xs">No hay documentos aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center p-2.5 rounded-lg border border-slate-100 hover:border-brand-green/30 hover:bg-brand-green/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                  {doc.type === 'FOTO' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate" title={doc.title}>{doc.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={`${getApiUrl()}${doc.url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-white rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
