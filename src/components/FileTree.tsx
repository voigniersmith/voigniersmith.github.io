import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { dir, dir_type } from '../data';
import { ColorMode } from '../terminal/terminal';
import './FileTree.css';

interface FileTreeItem {
  name: string;
  path: string;
  isDirectory: boolean;
  expanded?: boolean;
  depth: number;
}

interface FileTreeProps {
  currentDir?: string;
  onNavigate?: (path: string) => void;
  onFileSelect?: (file: string) => void;
  colorMode?: ColorMode;
}

const FileTree: React.FC<FileTreeProps> = ({ currentDir = '~', onNavigate, onFileSelect, colorMode = ColorMode.Dark }) => {
  const [tree, setTree] = useState<FileTreeItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['~']));
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Build the tree structure on mount
  useEffect(() => {
    buildTree();
  }, []);

  const buildTree = () => {
    const items: FileTreeItem[] = [];
    const rootFiles = dir['~' as keyof dir_type] || [];

    rootFiles.forEach(name => {
      const path = `~/${name}`;
      const isDir = dir[(path as any) as keyof dir_type] !== undefined;
      items.push({
        name,
        path,
        isDirectory: isDir,
        depth: 0,
      });
    });

    setTree(items);
  };

  const getNestedItems = useCallback((parentPath: string, depth: number): FileTreeItem[] => {
    const nestedItems: FileTreeItem[] = [];
    const contents = dir[(parentPath as any) as keyof dir_type];

    if (contents) {
      contents.forEach(name => {
        const path = `${parentPath}/${name}`;
        const isDir = dir[(path as any) as keyof dir_type] !== undefined;
        nestedItems.push({
          name,
          path,
          isDirectory: isDir,
          depth,
        });
      });
    }

    return nestedItems;
  }, []);

  // Build flat list of visible items for accurate selection tracking
  const visibleItems = useMemo(() => {
    const items: FileTreeItem[] = [];

    const addItem = (item: FileTreeItem) => {
      items.push(item);
      if (item.isDirectory && expandedDirs.has(item.path)) {
        const nested = getNestedItems(item.path, item.depth + 1);
        nested.forEach(addItem);
      }
    };

    tree.forEach(addItem);
    return items;
  }, [tree, expandedDirs, getNestedItems]);

  // Scroll selected item into view
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedIndex]);

  const themeNames: { [key in ColorMode]: string } = {
    [ColorMode.Dark]: 'file-tree-dark',
    [ColorMode.Light]: 'file-tree-light',
    [ColorMode.Dracula]: 'file-tree-dracula',
    [ColorMode.Nord]: 'file-tree-nord',
    [ColorMode.Monokai]: 'file-tree-monokai',
    [ColorMode.SolarizedDark]: 'file-tree-solarized-dark',
    [ColorMode.GruvBox]: 'file-tree-gruvbox',
  };

  const themeClass = colorMode !== undefined && colorMode in themeNames ? themeNames[colorMode as ColorMode] : 'file-tree-dark';

  const renderItems = useCallback((items: FileTreeItem[]): React.ReactNode => {
    return items.map((item) => {
      // Find the actual index of this item in the flattened visibleItems array
      const itemIndex = visibleItems.findIndex(vi => vi.path === item.path);

      return (
        <div key={item.path}>
          <div
            ref={itemIndex === selectedIndex ? selectedItemRef : null}
            className={`file-tree-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
            onClick={() => {
              setSelectedIndex(itemIndex);
              if (!item.isDirectory) {
                onFileSelect?.(item.path);
              }
            }}
            onDoubleClick={() => {
              if (item.isDirectory) {
                if (expandedDirs.has(item.path)) {
                  const newExpanded = new Set(expandedDirs);
                  newExpanded.delete(item.path);
                  setExpandedDirs(newExpanded);
                } else {
                  setExpandedDirs(new Set([...expandedDirs, item.path]));
                }
              }
            }}
            style={{ paddingLeft: `${12 + item.depth * 16}px` }}
          >
            <span className="file-tree-icon">
              {item.isDirectory ? (
                expandedDirs.has(item.path) ? '∨' : '>'
              ) : (
                '-'
              )}
            </span>
            <span className="file-tree-name">{item.name}</span>
          </div>
          {item.isDirectory && expandedDirs.has(item.path) && (
            <div>
              {renderItems(getNestedItems(item.path, item.depth + 1))}
            </div>
          )}
        </div>
      );
    });
  }, [selectedIndex, expandedDirs, onFileSelect, getNestedItems, visibleItems]);

  return (
    <div className={`file-tree ${themeClass}`}>
      <div className="file-tree-header">
        <span>┌─ EXPLORER</span>
      </div>
      <div className="file-tree-content">
        {renderItems(tree)}
      </div>
    </div>
  );
};

export default FileTree;
