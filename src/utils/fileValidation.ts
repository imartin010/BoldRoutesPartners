/**
 * File validation utilities for secure file uploads
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
}

// Default validation settings
export const DEFAULT_FILE_VALIDATION: Required<FileValidationOptions> = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  maxFiles: 5
};

/**
 * Validate a single file against security criteria
 */
export function validateFile(
  file: File, 
  options: FileValidationOptions = {}
): FileValidationResult {
  const opts = { ...DEFAULT_FILE_VALIDATION, ...options };

  // Check file size
  if (file.size > opts.maxSizeBytes) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is ${formatFileSize(opts.maxSizeBytes)}.`
    };
  }

  // Check file type by MIME type
  if (!opts.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File "${file.name}" has an unsupported format. Allowed types: PDF, Word documents, and images.`
    };
  }

  // Additional security check: verify file extension matches MIME type
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeToExtension: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp']
  };

  const expectedExtensions = mimeToExtension[file.type];
  if (expectedExtensions && extension && !expectedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File "${file.name}" has a suspicious file extension that doesn't match its content type.`
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple files and enforce count limits
 */
export function validateFiles(
  files: FileList | File[], 
  options: FileValidationOptions = {}
): FileValidationResult {
  const opts = { ...DEFAULT_FILE_VALIDATION, ...options };
  const fileArray = Array.from(files);

  // Check file count
  if (fileArray.length > opts.maxFiles) {
    return {
      isValid: false,
      error: `Too many files selected. Maximum ${opts.maxFiles} files allowed.`
    };
  }

  // Validate each file
  for (const file of fileArray) {
    const result = validateFile(file, options);
    if (!result.isValid) {
      return result;
    }
  }

  // Check total size
  const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = opts.maxSizeBytes * opts.maxFiles;
  
  if (totalSize > maxTotalSize) {
    return {
      isValid: false,
      error: `Total file size too large. Maximum total size is ${formatFileSize(maxTotalSize)}.`
    };
  }

  return { isValid: true };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts
  const basename = filename.split('/').pop() || filename;
  
  // Replace dangerous characters with underscores
  return basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Generate secure filename with UUID prefix
 */
export function generateSecureFilename(originalName: string): string {
  const sanitized = sanitizeFilename(originalName);
  const uuid = crypto.randomUUID();
  return `${uuid}-${sanitized}`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file appears to be an image (for preview purposes)
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Create a safe preview URL for images
 */
export function createImagePreview(file: File): string | null {
  if (!isImageFile(file)) {
    return null;
  }
  
  return URL.createObjectURL(file);
}

/**
 * Cleanup preview URLs to prevent memory leaks
 */
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
