import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Folder, 
  Tag,
  ShieldCheck
} from 'lucide-react';
import { MediaItem } from '../types';
import { apiRequest } from '../api/client';

export const MediaLibraryPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      const items = await apiRequest<MediaItem[]>('/media');
      setMediaList(items);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'default');
    formData.append('tags', JSON.stringify(['brand', 'social']));

    try {
      setUploading(true);
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.status === 'duplicate_reused') {
        alert('Notice: Identical file already exists in library; duplicate was prevented.');
      }
      await loadMedia();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media asset?')) return;
    try {
      await apiRequest(`/media/${id}`, { method: 'DELETE' });
      await loadMedia();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyPath = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Media Assets & Library</h2>
          <p className="text-sm text-slate-400">
            Centralized media storage with automatic SHA-256 hash deduplication.
          </p>
        </div>

        <label className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 cursor-pointer transition-all shadow-md shadow-sky-600/20">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Processing...' : 'Upload Media Asset'}</span>
          <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
        </label>
      </div>

      {/* Grid */}
      {mediaList.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No media uploaded yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload images, graphics, and video files to attach to multi-platform posts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((m) => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="h-32 bg-slate-950 flex items-center justify-center overflow-hidden relative">
                {m.mime_type.startsWith('image') ? (
                  <img src={m.file_path} alt={m.original_name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                )}
              </div>

              <div className="p-3 space-y-2">
                <p className="text-xs font-semibold text-white truncate" title={m.original_name}>
                  {m.original_name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{(m.file_size / 1024).toFixed(1)} KB</span>
                  <span className="font-mono text-slate-500">SHA-256 ✓</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <button
                    onClick={() => handleCopyPath(m.file_path, m.id)}
                    className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center space-x-1"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === m.id ? 'Copied' : 'Copy Path'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
