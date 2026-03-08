import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Image, FileText, Film, Music, Archive } from 'lucide-react';

interface MediaUpload {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export const AdminMedia = () => {
  const [media, setMedia] = useState<MediaUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={20} className="text-blue-600" />;
    if (fileType.startsWith('video/')) return <Film size={20} className="text-purple-600" />;
    if (fileType.startsWith('audio/')) return <Music size={20} className="text-green-600" />;
    if (fileType.includes('pdf')) return <FileText size={20} className="text-red-600" />;
    return <Archive size={20} className="text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-2">Manage your uploaded files</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Archive className="text-yellow-600 mt-0.5" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">
              Upload Functionality Not Available
            </h3>
            <p className="text-yellow-800">
              Media upload functionality requires file storage configuration. Please configure
              Supabase Storage buckets to enable file uploads.
            </p>
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Image className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media files yet</h3>
          <p className="text-gray-600">Media files will appear here once storage is configured</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {media.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.file_type)}
                        <span className="text-sm font-medium text-gray-900">{file.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.file_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
