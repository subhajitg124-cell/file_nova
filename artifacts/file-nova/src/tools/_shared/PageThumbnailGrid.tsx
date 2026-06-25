import React, { useState, useEffect, useRef } from "react";
import { GripVertical, RotateCw, RotateCcw, Check, X } from "lucide-react";

export interface PageThumbnailGridProps {
  pages: { pageNumber: number; thumbnailUrl: string; rotation?: number }[];
  mode: "select" | "reorder" | "rotate-individual" | "view-only";
  selectedPages?: Set<number>;
  onSelectionChange?: (pages: Set<number>) => void;
  onReorder?: (newOrder: number[]) => void;
  onRotatePage?: (pageNumber: number, degrees: 90 | 180 | 270) => void;
  renderOverlay?: (pageNumber: number) => React.ReactNode;
}

// LazyImage component using IntersectionObserver
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={`relative w-full h-full bg-muted flex items-center justify-center ${className}`}>
      {isInView ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      ) : null}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground/60 text-[10px] font-bold">
          Loading...
        </div>
      )}
    </div>
  );
};

export const PageThumbnailGrid: React.FC<PageThumbnailGridProps> = ({
  pages,
  mode,
  selectedPages = new Set(),
  onSelectionChange,
  onReorder,
  onRotatePage,
  renderOverlay,
}) => {
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [items, setItems] = useState(pages);

  // Sync internal state with pages prop
  useEffect(() => {
    setItems(pages);
  }, [pages]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (mode !== "reorder") return;
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (mode !== "reorder") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (mode !== "reorder") return;
    e.preventDefault();
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragOverIndex(null);
      dragIndexRef.current = null;
      return;
    }
    const updated = [...items];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setItems(updated);
    setDragOverIndex(null);
    dragIndexRef.current = null;

    if (onReorder) {
      onReorder(updated.map((item) => item.pageNumber));
    }
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  const handlePageClick = (pageNumber: number) => {
    if (mode !== "select") return;
    const nextSelected = new Set(selectedPages);
    if (nextSelected.has(pageNumber)) {
      nextSelected.delete(pageNumber);
    } else {
      nextSelected.add(pageNumber);
    }
    if (onSelectionChange) {
      onSelectionChange(nextSelected);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-1">
      {items.map((page, index) => {
        const isSelected = selectedPages.has(page.pageNumber);
        const isBeingDragged = dragIndexRef.current === index;
        const isDragTarget = dragOverIndex === index && dragIndexRef.current !== index;
        const rot = page.rotation || 0;

        return (
          <div
            key={page.pageNumber}
            draggable={mode === "reorder"}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => handlePageClick(page.pageNumber)}
            className={`group relative aspect-[3/4] rounded-2xl border transition-all duration-150 overflow-hidden flex flex-col justify-between
              ${mode === "select" ? "cursor-pointer" : ""}
              ${mode === "reorder" ? "cursor-grab active:cursor-grabbing" : ""}
              ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg bg-primary/5" : "border-border bg-muted/60 hover:border-border"}
              ${isBeingDragged ? "opacity-40 scale-95 border-indigo-500/40 bg-primary/5" : ""}
              ${isDragTarget ? "border-indigo-500 bg-primary/10 scale-102 ring-2 ring-indigo-500/30" : ""}
            `}
          >
            {/* Page number badge */}
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-lg bg-card/80 border border-border text-[9px] font-black tracking-wider text-foreground/80 select-none">
              P. {page.pageNumber}
            </div>

            {/* Selection indicators */}
            {mode === "select" && isSelected && (
              <div className="absolute top-2 right-2 z-10 h-5 w-5 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white shadow-lg animate-scale-in">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            )}

            {/* Drag Handle */}
            {mode === "reorder" && (
              <div className="absolute top-2 right-2 z-10 h-5 w-5 rounded-lg bg-card/80 border border-border flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-3 w-3" />
              </div>
            )}

            {/* Thumbnail Canvas */}
            <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-card/20">
              <div
                style={{ transform: `rotate(${rot}deg)` }}
                className="w-full h-full transition-transform duration-200"
              >
                <LazyImage
                  src={page.thumbnailUrl}
                  alt={`Page ${page.pageNumber}`}
                  className="rounded-lg shadow"
                />
              </div>
            </div>

            {/* Hover actions in rotate-individual mode */}
            {mode === "rotate-individual" && onRotatePage && (
              <div className="absolute inset-0 bg-card/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10 backdrop-blur-[1px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(page.pageNumber, 270); // 90 CCW / 270 CW
                  }}
                  title="Rotate CCW"
                  className="p-2.5 rounded-xl bg-muted border border-border hover:bg-accent text-foreground/80 hover:text-foreground transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(page.pageNumber, 90); // 90 CW
                  }}
                  title="Rotate CW"
                  className="p-2.5 rounded-xl bg-muted border border-border hover:bg-accent text-foreground/80 hover:text-foreground transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Custom Overlay */}
            {renderOverlay && renderOverlay(page.pageNumber)}
          </div>
        );
      })}
    </div>
  );
};
