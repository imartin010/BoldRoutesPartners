import { useCallback, useState } from 'react';
import { Upload, X, File } from 'lucide-react';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface FileDropzoneProps {
  files: FileInfo[];
  onFilesChange: (files: FileInfo[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  error?: string;
}

export default function FileDropzone({
  files,
  onFilesChange,
  maxFiles = 10,
  acceptedTypes = [],
  className = '',
  error
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles: FileInfo[] = [];

    fileArray.forEach(file => {
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        return; // Skip invalid file types
      }

      if (files.length + validFiles.length >= maxFiles) {
        return; // Skip if max files reached
      }

      validFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      });
    });

    onFilesChange([...files, ...validFiles]);
  }, [files, onFilesChange, maxFiles, acceptedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
          isDragging
            ? 'border-primary bg-primary/5'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Maximum {maxFiles} files
          {acceptedTypes.length > 0 && (
            <span> • Accepted: {acceptedTypes.join(', ')}</span>
          )}
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="btn-primary cursor-pointer inline-block"
        >
          Choose Files
        </label>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
