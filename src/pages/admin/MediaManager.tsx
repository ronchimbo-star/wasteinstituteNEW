import { useEffect, useState } from 'react';
import { Upload, Trash2, Copy, CheckCircle, Image as ImageIcon, FileText, Video, File } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface MediaFile {
  id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export default function MediaManager() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const [uploadForm, setUploadForm] = useState({
    filename: '',
    file_url: '',
    file_type: '',
    file_size: 0,
    width: null as number | null,
    height: null as number | null,
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setMediaFiles(data);
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${timestamp}_${sanitizedFilename}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      let publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/${uploadData.path}`;
      let finalWidth = null;
      let finalHeight = null;
      let finalSize = file.size;

      if (file.type.startsWith('image/')) {
        try {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          finalWidth = img.width;
          finalHeight = img.height;
          URL.revokeObjectURL(img.src);

          const optimizeResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                bucket: 'media',
                path: uploadData.path,
                maxWidth: 1920,
                quality: 85,
              }),
            }
          );

          if (optimizeResponse.ok) {
            const optimizeData = await optimizeResponse.json();
            if (optimizeData.success) {
              publicUrl = optimizeData.publicUrl;
              finalSize = optimizeData.optimizedSize;
            }
          }
        } catch (optimizeError) {
          console.warn('Image optimization failed, using original:', optimizeError);
        }
      }

      const { error: insertError } = await supabase.from('media_files').insert([
        {
          filename: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: finalSize,
          width: finalWidth,
          height: finalHeight,
          uploaded_by: user?.id,
        },
      ]);

      if (insertError) throw insertError;

      event.target.value = '';
      loadMedia();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.filename || !uploadForm.file_url) {
      alert('Please provide filename and URL');
      return;
    }

    setIsUploading(true);
    const { error } = await supabase.from('media_files').insert([{
      ...uploadForm,
      uploaded_by: user?.id,
    }]);

    if (error) {
      alert('Error uploading file: ' + error.message);
      setIsUploading(false);
      return;
    }

    setUploadForm({
      filename: '',
      file_url: '',
      file_type: '',
      file_size: 0,
      width: null,
      height: null,
    });
    setIsUploading(false);
    loadMedia();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting file: ' + error.message);
      return;
    }

    loadMedia();
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      alert('Failed to copy URL');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.includes('pdf')) return 'PDF';
    return 'File';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
        <p className="text-gray-600 mt-1">Upload and manage media files</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Upload size={24} />
          Upload Media File
        </h2>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-xl p-8 mb-6 text-center">
          <Upload className="mx-auto text-emerald-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Your Files
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Images are automatically optimized and converted to WebP format for faster loading
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors disabled:bg-gray-400">
            <Upload size={20} />
            {isUploading ? 'Uploading & Optimizing...' : 'Choose File'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              accept="image/*,video/*,application/pdf"
            />
          </label>
        </div>

        <details className="mb-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-emerald-600 transition-colors">
            Or add file from external URL
          </summary>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Add files from external hosting services (like CDNs) by providing the URL below.
            </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filename *
              </label>
              <input
                type="text"
                value={uploadForm.filename}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, filename: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="document.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Type *
              </label>
              <input
                type="text"
                value={uploadForm.file_type}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, file_type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="application/pdf"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File URL *
            </label>
            <input
              type="text"
              value={uploadForm.file_url}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, file_url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="https://your-cdn.com/files/document.pdf"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Size (bytes)
              </label>
              <input
                type="number"
                value={uploadForm.file_size}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    file_size: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px, optional)
              </label>
              <input
                type="number"
                value={uploadForm.width || ''}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    width: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px, optional)
              </label>
              <input
                type="number"
                value={uploadForm.height || ''}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    height: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
          >
            <Upload size={20} />
            {isUploading ? 'Adding...' : 'Add File'}
          </button>
        </div>
          </div>
        </details>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Media Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : mediaFiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No media files yet. Add your first file above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {mediaFiles.map((file) => {
              const Icon = getFileIcon(file.file_type);
              return (
                <div
                  key={file.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-500 transition-colors"
                >
                  {file.file_type.startsWith('image/') ? (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={file.file_url}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <Icon size={64} className="text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-600 uppercase">
                        {getFileTypeLabel(file.file_type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {file.filename}
                    </h3>
                    {file.width && file.height && (
                      <p className="text-xs text-gray-500 mb-2">
                        {file.width} × {file.height}px
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(file.file_url, file.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                      >
                        {copiedId === file.id ? (
                          <>
                            <CheckCircle size={16} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy URL
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
