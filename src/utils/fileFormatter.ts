/**
 * File formatter utility for terminal display
 * Provides ANSI color codes and file type detection
 */

export enum FileType {
  Directory = 'directory',
  Executable = 'executable',
  Image = 'image',
  Code = 'code',
  Document = 'document',
  Archive = 'archive',
  Text = 'text',
  Unknown = 'unknown',
}

export function getFileType(filename: string): FileType {
  // Special cases
  if (filename === '.' || filename === '..') {
    return FileType.Directory;
  }

  const lower = filename.toLowerCase();

  // Code files
  if (/\.(js|ts|tsx|jsx|py|java|c|cpp|h|rs|go|rb|php|html|css|json|xml|yaml|yml)$/i.test(lower)) {
    return FileType.Code;
  }

  // Image files
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i.test(lower)) {
    return FileType.Image;
  }

  // Document files
  if (/\.(md|txt|doc|docx|pdf)$/i.test(lower)) {
    return FileType.Document;
  }

  // Archive files
  if (/\.(zip|tar|gz|rar|7z|bz2)$/i.test(lower)) {
    return FileType.Archive;
  }

  // Executable files
  if (/\.(exe|sh|bat|bin)$/i.test(lower)) {
    return FileType.Executable;
  }

  return FileType.Unknown;
}

/**
 * Get ANSI color code for file type
 * Uses theme-agnostic colors that work well in both light and dark terminals
 */
export function getColorCode(fileType: FileType): string {
  switch (fileType) {
    case FileType.Directory:
      return '\x1b[34m'; // Blue
    case FileType.Executable:
      return '\x1b[32m'; // Green
    case FileType.Image:
      return '\x1b[35m'; // Magenta
    case FileType.Code:
      return '\x1b[33m'; // Yellow
    case FileType.Document:
      return '\x1b[36m'; // Cyan
    case FileType.Archive:
      return '\x1b[31m'; // Red
    case FileType.Text:
      return '\x1b[37m'; // White
    default:
      return '\x1b[0m'; // Reset
  }
}

const RESET = '\x1b[0m';

/**
 * Format a filename with color and icon based on file type
 */
export function formatFilename(filename: string): string {
  const fileType = getFileType(filename);
  const colorCode = getColorCode(fileType);

  // Add directory indicator
  if (filename === '.' || filename === '..') {
    return `${colorCode}${filename}${RESET}`;
  }

  return `${colorCode}${filename}${RESET}`;
}

/**
 * Format a full file listing with colors
 */
export function formatLsOutput(files: string[]): string[] {
  return files.map((file) => `  ${formatFilename(file)}`);
}
