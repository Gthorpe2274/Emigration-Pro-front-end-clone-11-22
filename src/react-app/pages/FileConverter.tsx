import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, File, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  // Use relative URL - Vite proxy will handle /api/* requests in dev mode
  // In production, same origin is used
  return '';
};

interface ConvertedFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: 'md' | 'pdf';
  convertedAt: string;
  size: number;
}

function FileConverter() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all converted files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/file-converter/files`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
      } else {
        setError(data.error || 'Failed to fetch files');
      }
    } catch (err) {
      setError('Failed to fetch files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file upload and conversion
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'md' && fileExtension !== 'pdf') {
      setError('Please upload a .md or .pdf file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/file-converter/upload`, {
        method: 'POST',
        body: formData,
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `Server error: ${response.status}` };
        }
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(`File "${file.name}" converted successfully!`);
        await fetchFiles(); // Refresh file list
        // Reset file input
        event.target.value = '';
      } else {
        setError(data.error || 'Failed to convert file');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle file download
  const handleDownload = async (file: ConvertedFile) => {
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/file-converter/download/${file.id}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file');
      console.error(err);
    }
  };

  // Handle single file deletion
  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/file-converter/delete/${fileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('File deleted successfully');
        setSelectedFiles(new Set());
        await fetchFiles();
      } else {
        setError(data.error || 'Failed to delete file');
      }
    } catch (err) {
      setError('Failed to delete file');
      console.error(err);
    }
  };

  // Handle multiple file deletion
  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) return;

    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/file-converter/delete-multiple`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds: Array.from(selectedFiles) }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${selectedFiles.size} file(s) deleted successfully`);
        setSelectedFiles(new Set());
        await fetchFiles();
      } else {
        setError(data.error || 'Failed to delete files');
      }
    } catch (err) {
      setError('Failed to delete files');
      console.error(err);
    }
  };

  // Toggle file selection
  const toggleSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            File Converter
          </h1>
          <p className="text-xl text-gray-600">
            Convert .md and .pdf files to HTML format
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                uploading
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 mb-4 text-gray-400" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">
                    {uploading ? 'Uploading and converting...' : 'Click to upload'}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  PDF or Markdown files (.md, .pdf)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".md,.pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-700">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Files List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Converted Files ({files.length})
            </h2>
            {selectedFiles.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedFiles.size})
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No converted files yet</p>
              <p className="text-gray-500">Upload a file to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedFiles.size === files.length && files.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Converted At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleSelection(file.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {file.fileType === 'pdf' ? (
                            <File className="w-5 h-5 text-red-500 mr-2" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {file.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {file.fileType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.convertedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(file)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileConverter;

