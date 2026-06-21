import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, RefreshCw, Sparkles, AlertCircle, Search, Save, HelpCircle, 
  Undo2, Redo2, ZoomIn, ZoomOut, Activity, Info, Calendar, 
  ChevronRight, Download, Trash2, Play, CheckCircle2, Shield, Eye, Settings2, Clock, Upload, Camera, Clipboard, FileQuestion, FolderGit, AlertTriangle, Star, CheckCircle, FileText, CloudOff, CloudLightning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDropZone } from "./FileDropZone";
import { DownloadResult } from "./DownloadResult";
import { useSubscription } from "@/hooks/useSubscription";
import { Confetti } from "@/components/AnimatedEffects";
import { Progress } from "@/components/ui/progress";
import { FileRecord, useFileStore } from "@/store/useFileStore";
import { TOOL_REGISTRY, WorkspaceType, featureFlags } from "@/lib/toolPlugin";
import { trieSearch } from "@/lib/trieSearch";
import { BeforeAfterSlider } from "../shared/BeforeAfterSlider";
import { PrivacyDashboard } from "./PrivacyDashboard";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { workspaceRegistry, UtilityWorkspace } from "./WorkspaceRegistry";
import { ExportCenter } from "./ExportCenter";
import { toast } from "sonner";
import { fileDatabase, DBFileRecord } from "@/lib/fileDatabase";
import { analytics } from "@/lib/analytics";
import { getBrandedFileName, getExtensionForMime, getOutputExtensionForSlug } from "@/hooks/useToolProcessor";

export interface ToolWorkspaceProps {
  toolName: string;
  toolDescription: string;
  toolIcon: React.ReactNode;
  accentColor: string;
  configPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  onProcess: () => Promise<void>;
  isProcessing: boolean;
  progress?: number;
  isReady: boolean;
  resultFile?: { name: string; url: string; size: string; savings?: string } | null;
  onReset: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  onFilesSelected: (files: File[]) => void;
  files: FileRecord[];
  error?: string | null;
}

export const TOOL_THEMES: Record<string, { accent: string; bg: string; border: string; text: string; gradient: string; glow: string }> = {
  violet: { accent: "violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30" },
  blue:   { accent: "blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   gradient: "from-blue-500 to-cyan-500",    glow: "shadow-blue-500/30" },
  emerald:{ accent: "emerald-500",bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/30" },
  amber:  { accent: "amber-500",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/30" },
  red:    { accent: "red-500",    bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400",    gradient: "from-red-500 to-rose-600",     glow: "shadow-red-500/30" },
  pink:   { accent: "pink-500",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   text: "text-pink-400",   gradient: "from-pink-500 to-fuchsia-500", glow: "shadow-pink-500/30" },
  orange: { accent: "orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", gradient: "from-orange-500 to-amber-600",  glow: "shadow-orange-500/30" },
  indigo: { accent: "indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", gradient: "from-indigo-500 to-blue-600",   glow: "shadow-indigo-500/30" },
  lime:   { accent: "lime-500",   bg: "bg-lime-500/10",   border: "border-lime-500/20",   text: "text-lime-400",   gradient: "from-lime-500 to-green-600",   glow: "shadow-lime-500/30" },
  purple: { accent: "purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", gradient: "from-purple-500 to-pink-600",  glow: "shadow-purple-500/30" },
  sky:    { accent: "sky-500",    bg: "bg-sky-500/10",    border: "border-sky-500/20",    text: "text-sky-400",   gradient: "from-sky-500 to-blue-500",     glow: "shadow-sky-500/30" },
  cyan:   { accent: "cyan-500",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400",   gradient: "from-cyan-500 to-teal-600",    glow: "shadow-cyan-500/30" },
};

const COMPLIANCE_TIPS = [
  "SVMCM Tip: Income certificates must be signed by a Joint BDO or higher to avoid portal rejection.",
  "NSDL PAN Tip: Ensure candidate photographs are cropped under 20KB and signatures under 10KB.",
  "UIDAI Tip: Do not upload unmasked Aadhaar cards to public portals. Mask the first 8 digits first.",
  "CSC Kiosk Tip: Merging multiple marksheets into a single PDF saves upload times on slow connections.",
  "Security Tip: Clear your session cache after processing personal identity documents in public cafes.",
  "Admissions Tip: Convert scanned files to webp/jpg to resize them below size limits."
];

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  toolName,
  toolDescription,
  toolIcon,
  accentColor,
  configPanel,
  previewPanel,
  onProcess,
  isProcessing,
  progress = 0,
  isReady,
  resultFile,
  onReset,
  maxFiles = 1,
  acceptedTypes = ["*"],
  onFilesSelected,
  files,
  error,
}) => {
  const [location, setLocation] = useLocation();
  const slug = location.replace(/^\//, "");
  const { premiumTier, premiumEnabled } = useSubscription();
  const { customFileName, setCustomFileName } = useFileStore();
  const settingsRef = useRef<HTMLDivElement>(null);

  // Core UI States
  const [zoom, setZoom] = useState<number>(100);
  const [timelineLogs, setTimelineLogs] = useState<Array<{ time: string; text: string }>>([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Workspace initialized" }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<Array<{ name: string; url: string; time: string }>>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);

  // Polishing states: Compliance tips ticker and image enhancement sliders
  const [tipIndex, setTipIndex] = useState(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

  // Phase 2 User Projects & Global File Manager States
  const [currentProject, setCurrentProject] = useState<string>("Default Package");
  const [projectsList, setProjectsList] = useState<string[]>([
    "Default Package", "Passport Application", "College Documents", "Resume Package", "Tax Documents"
  ]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeTab, setActiveTab] = useState<"current" | "recent" | "downloads" | "favorites">("current");
  const [projectFiles, setProjectFiles] = useState<DBFileRecord[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<DBFileRecord[]>([]);

  // Phase 4: Storage space warnings state
  const [dbSize, setDbSize] = useState<number>(0);

  // Universal Upload Hub State
  const [detectedType, setDetectedType] = useState<"pdf" | "image" | "document" | null>(null);
  const [uploadRecommendations, setUploadRecommendations] = useState<string[]>([]);

  // Mobile drawer controls panel toggle
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"preview" | "settings">("preview");

  const theme = TOOL_THEMES[accentColor] || TOOL_THEMES.violet;
  const hasFiles = files.length > 0 || slug === "scholarship-zip" || slug === "ai-ppt-maker";

  // Retrieve current active registry item
  const currentPlugin = TOOL_REGISTRY[slug] || {
    id: slug,
    name: toolName,
    workspaceType: WorkspaceType.UTILITY,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    relatedTools: ["merge-pdf", "compress-pdf", "ocr"],
    description: toolDescription,
  };

  // Usage tracking event logger
  const trackEvent = (event: { tool: string; action: string; metadata?: any }) => {
    console.log(`[FileNova Analytics]`, event);
    logAction(`Tracked: ${event.action} for ${event.tool}`);
    analytics.logEvent(event.tool, event.action, event.metadata);
  };

  // Compliance Tip Ticker Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % COMPLIANCE_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Online connection tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection re-established. Online mode synced.");
      logAction("Connection status: ONLINE");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Network connection lost. Running in Offline Caching mode.");
      logAction("Connection status: OFFLINE");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load projects list from localStorage & run auto storage cleanup
  useEffect(() => {
    const saved = localStorage.getItem("fn_user_projects_list");
    if (saved) {
      try {
        setProjectsList(JSON.parse(saved));
      } catch (_) {}
    }
    const savedActive = localStorage.getItem("fn_active_project_name");
    if (savedActive) {
      setCurrentProject(savedActive);
    }

    // Phase 4: Run auto storage cleanup
    if (featureFlags.indexedDb) {
      (async () => {
        try {
          const deleted = await fileDatabase.cleanupOldFiles();
          if (deleted > 0) {
            logAction(`Storage Cleanup: Purged ${deleted} expired temp files.`);
            toast.info(`Auto-cleanup: Cleared ${deleted} expired cache items.`);
          }
          const size = await fileDatabase.getDatabaseSize();
          setDbSize(size);
        } catch (e) {
          console.error("Cleanup/size query failed", e);
        }
      })();
    }
  }, []);

  // Sync / load files from IndexedDB
  const syncIndexedDbFiles = async () => {
    if (!featureFlags.indexedDb) return;
    try {
      const pFiles = await fileDatabase.getFilesByProject(currentProject);
      setProjectFiles(pFiles);

      let category: "Recent" | "Downloads" | "Favorites" = "Recent";
      if (activeTab === "recent") category = "Recent";
      else if (activeTab === "downloads") category = "Downloads";
      else if (activeTab === "favorites") category = "Favorites";

      const catFiles = await fileDatabase.getFilesByCategory(category);
      // Filter by project for isolated sandboxes
      setLibraryFiles(catFiles.filter(f => f.project === currentProject));

      // Calculate total IndexedDB storage size
      const size = await fileDatabase.getDatabaseSize();
      setDbSize(size);
    } catch (e) {
      console.error("Failed to query IndexedDB files", e);
    }
  };

  useEffect(() => {
    syncIndexedDbFiles();
  }, [currentProject, activeTab, resultFile]);



  // Load recent processed files from localStorage
  useEffect(() => {
    const fetchRecent = () => {
      const list: any[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("fn_recent_file_")) {
          try {
            list.push(JSON.parse(localStorage.getItem(key) || ""));
          } catch (_) {}
        }
      });
      setRecentFiles(list.sort((a, b) => b.timestamp - a.timestamp));
    };
    fetchRecent();
  }, [resultFile]);

  // Append logs on processing events
  useEffect(() => {
    if (isProcessing) {
      logAction(`Running optimization tasks... Progress: ${progress}%`);
    }
  }, [isProcessing, progress]);

  // Process Completed Effect
  useEffect(() => {
    if (resultFile) {
      logAction(`Completed successfully. Output file: ${resultFile.name}`);
      toast.success("File processed successfully. Download ready!");
      
      const startTime = timelineLogs[0]?.time ? new Date(`1970/01/01 ${timelineLogs[0].time}`).getTime() : Date.now();
      const duration = Date.now() - startTime;

      trackEvent({ tool: slug, action: "process_complete", metadata: { duration } });
      
      // Save recent processed file to history
      const key = `fn_recent_file_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({
        name: resultFile.name,
        url: resultFile.url,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      }));

      // Cache processing output in IndexedDB
      if (featureFlags.indexedDb) {
        (async () => {
          try {
            const response = await fetch(resultFile.url);
            const blob = await response.blob();
            await fileDatabase.saveFile({
              id: `res-${Date.now()}`,
              name: resultFile.name,
              size: blob.size,
              type: blob.type,
              blob: blob,
              category: "Downloads",
              project: currentProject,
              timestamp: Date.now()
            });
            syncIndexedDbFiles();
            logAction("Output document cached in IndexedDB.");
          } catch (e) {
            console.error("IndexedDB Output caching failed", e);
          }
        })();
      }
    }
  }, [resultFile]);

  useEffect(() => {
    if (error) {
      logAction(`Operation failed: ${error}`);
      toast.error("Operation failed. Try error recovery choices.");
      trackEvent({ tool: slug, action: "process_failed", metadata: { error } });
    }
  }, [error]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveSession();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        toast.info("Undo action triggered successfully.");
        trackEvent({ tool: slug, action: "keyboard_undo" });
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        toast.info("Redo action triggered successfully.");
        trackEvent({ tool: slug, action: "keyboard_redo" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, currentProject]);

  const logAction = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTimelineLogs(prev => [...prev, { time, text }]);
  };

  const handleSaveSession = () => {
    if (files.length === 0) {
      toast.error("No active files inside queue to save.");
      return;
    }
    const session = {
      slug,
      files: files.map(f => ({ id: f.id, name: f.name, size: f.size, type: f.type })),
      timestamp: Date.now()
    };
    localStorage.setItem(`file-nova-session-${slug}`, JSON.stringify(session));
    toast.success("Workspace session autosaved locally.");
    logAction("Autosaved current configuration session");
    trackEvent({ tool: slug, action: "session_saved" });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSearchResults(trieSearch.search(val).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  // Phase 4: Dynamic suggestions using weighted analytics counts
  const getRecommendedTools = () => {
    let baseTools: string[] = [];
    if (files.length === 0) {
      baseTools = currentPlugin.relatedTools || [];
    } else {
      const ext = files[0].name.split('.').pop()?.toLowerCase();
      if (ext === "pdf") {
        baseTools = ["compress-pdf", "protect-pdf", "pdf-to-word", "ocr"];
      } else if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
        baseTools = ["resize-image", "remove-background", "jpg-to-pdf"];
      } else {
        baseTools = currentPlugin.relatedTools || [];
      }
    }

    const events = analytics.getEvents();
    const transitions = events.filter(e => e.action === "workflow_continue");
    const counts: Record<string, number> = {};

    transitions.forEach(e => {
      const target = e.metadata?.nextToolId;
      if (target) {
        counts[target] = (counts[target] || 0) + 1;
      }
    });

    return [...baseTools].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handles custom Upload Anything detection
  const handleUniversalUpload = async (selected: File[]) => {
    if (selected.length === 0) return;
    const file = selected[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    logAction(`Universal upload file detected: ${file.name}`);
    trackEvent({ tool: slug, action: "universal_upload_detected", metadata: { name: file.name, type: file.type } });

    // Cache upload in IndexedDB
    if (featureFlags.indexedDb) {
      try {
        await fileDatabase.saveFile({
          id: `raw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          blob: file,
          category: "Recent",
          project: currentProject,
          timestamp: Date.now()
        });
        syncIndexedDbFiles();
      } catch (err) {
        console.error("IndexedDB upload save failed", err);
      }
    }

    if (ext === "pdf") {
      setDetectedType("pdf");
      setUploadRecommendations(["merge-pdf", "compress-pdf", "pdf-to-word", "protect-pdf"]);
    } else if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      setDetectedType("image");
      setUploadRecommendations(["resize-image", "remove-background", "pan-card-resize", "jpg-to-pdf"]);
    } else {
      setDetectedType("document");
      setUploadRecommendations(["word-to-pdf", "government-form-fill", "scholarship-zip"]);
    }
    onFilesSelected(selected);
  };

  // Import file from IndexedDB Library directly to the current workspace raw files
  const handleImportLibraryFile = async (dbFile: DBFileRecord) => {
    try {
      const file = new File([dbFile.blob], dbFile.name, { type: dbFile.type });
      onFilesSelected([file]);
      toast.success(`Loaded "${dbFile.name}" into current workspace queue.`);
      logAction(`Loaded file from library: ${dbFile.name}`);
      trackEvent({ tool: slug, action: "import_library_file", metadata: { name: dbFile.name } });
    } catch (err) {
      toast.error("Failed to import library file.");
    }
  };

  // Delete file from IndexedDB Global File Manager
  const handleDeleteLibraryFile = async (id: string) => {
    try {
      await fileDatabase.deleteFile(id);
      toast.success("File deleted from workspace library.");
      syncIndexedDbFiles();
      logAction(`Deleted file from IndexedDB database`);
    } catch (err) {
      toast.error("Failed to delete file.");
    }
  };

  // Toggle favorite tag
  const handleToggleFavoriteFile = async (dbFile: DBFileRecord) => {
    try {
      const newCategory = dbFile.category === "Favorites" ? "Recent" : "Favorites";
      await fileDatabase.saveFile({
        ...dbFile,
        category: newCategory
      });
      toast.success(newCategory === "Favorites" ? "Added to Favorites." : "Removed from Favorites.");
      syncIndexedDbFiles();
    } catch (err) {
      toast.error("Failed to update favorite status.");
    }
  };

  // Download library file
  const handleDownloadLibraryFile = (dbFile: DBFileRecord) => {
    const url = URL.createObjectURL(dbFile.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = dbFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${dbFile.name}`);
  };

  // Phase 4: Batch continue Carrying multiple results blobs to the next tool in transition
  const handleContinueWorkflow = async (nextToolId: string) => {
    logAction(`Initiating batch workflow transition to ${nextToolId}`);
    trackEvent({ tool: slug, action: "workflow_continue", metadata: { nextToolId } });
    toast.success(`Workflow pipeline: Transitioning batch queue to ${nextToolId}`);
    
    try {
      // Find all output downloads files inside this project container
      const dbFiles = await fileDatabase.getFilesByProject(currentProject);
      const outputFiles = dbFiles.filter(f => f.category === "Downloads");

      const store = useFileStore.getState();
      store.clearStore();

      if (outputFiles.length > 0) {
        const fileObjects = outputFiles.map(f => new File([f.blob], f.name, { type: f.type }));
        store.addRawFiles(fileObjects);
      } else if (resultFile) {
        // Fallback to single resultFile
        const response = await fetch(resultFile.url);
        const blob = await response.blob();
        const nextFile = new File([blob], resultFile.name, { type: blob.type });
        store.addRawFiles([nextFile]);
      }
      
      setLocation(`/${nextToolId}`);
    } catch (e) {
      toast.error("Failed to carry over batch workflow queue.");
      console.error(e);
    }
  };

  // Polishing Enhancement: Security Shredder to clear all local IndexedDB data and histories
  const handlePanicShredder = async () => {
    if (window.confirm("CRITICAL WARNING: This will permanently delete ALL active project files, downloads, and favorites from the browser database, clear your local history, and close the workspace. Are you sure?")) {
      try {
        await fileDatabase.clearDatabase();
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("fn_recent_file_") || key.startsWith("file-nova-session-")) {
            localStorage.removeItem(key);
          }
        });
        const store = useFileStore.getState();
        store.clearStore();
        toast.success("Security purge complete. All documents shredded.");
        setLocation("/");
      } catch (err) {
        toast.error("Failed to complete data shredding.");
      }
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim();
    if (name && !projectsList.includes(name)) {
      const updated = [...projectsList, name];
      setProjectsList(updated);
      localStorage.setItem("fn_user_projects_list", JSON.stringify(updated));
      setCurrentProject(name);
      localStorage.setItem("fn_active_project_name", name);
      setNewProjectName("");
      setShowAddProject(false);
      toast.success(`Project container "${name}" created.`);
      logAction(`Created new project context: ${name}`);
    }
  };

  const handleProjectChange = (val: string) => {
    setCurrentProject(val);
    localStorage.setItem("fn_active_project_name", val);
    logAction(`Switched project context to: ${val}`);
  };

  // Polishing Enhancement: Canvas Drag and Drop Appender handlers
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCanvas(true);
  };

  const handleCanvasDragLeave = () => {
    setIsDraggingCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCanvas(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      handleUniversalUpload(selectedFiles);
      toast.success(`Appended ${selectedFiles.length} file(s) to document queue.`);
    }
  };

  // Resolution workflow pipeline status
  const getPipelineSteps = () => {
    const nextToolId = getRecommendedTools()[0] || "compress-pdf";
    const nextToolName = TOOL_REGISTRY[nextToolId]?.name || "Next Tool";

    return [
      { id: "upload", label: "Upload File", status: hasFiles ? "done" : "active" },
      { id: "process", label: toolName, status: resultFile ? "done" : (hasFiles ? "active" : "pending") },
      { id: "next", label: nextToolName, status: resultFile ? "active" : "pending" },
      { id: "download", label: "Download Output", status: resultFile ? "done" : "pending" }
    ];
  };

  // Workspace Component resolution
  const WorkspaceComponent = workspaceRegistry[currentPlugin.workspaceType] || UtilityWorkspace;

  // Polishing Enhancement: Brightness/Contrast Wrapper Filters
  const filterClassName = (currentPlugin.category === "image" || currentPlugin.category === "ocr")
    ? "fn-dynamic-filter"
    : "";

  const renderPrimaryActionButton = (isFooter = false) => {
    const paddingClass = isFooter ? "py-2.5 px-3" : "py-3 px-4";
    const textClass = isFooter ? "text-[10px]" : "text-[11px]";
    
    if (isProcessing) {
      return (
        <div className="space-y-1.5 w-full">
          <Progress value={progress} className="h-1.5 bg-slate-800 animate-pulse" />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span className="animate-pulse">Processing...</span>
            <span>{progress}%</span>
          </div>
        </div>
      );
    }

    if (resultFile) {
      return (
        <button
          onClick={onReset}
          className={`w-full ${paddingClass} ${textClass} bg-slate-800 hover:bg-slate-750 border border-white/10 text-white rounded-xl font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Clear Results
        </button>
      );
    }

    return (
      <div className="flex gap-2 w-full font-sans">
        <button
          onClick={onReset}
          className={`flex-1 ${paddingClass} ${textClass} border border-white/10 rounded-xl font-black uppercase text-slate-400 hover:text-white transition cursor-pointer`}
        >
          Clear
        </button>
        <button
          onClick={onProcess}
          disabled={!isReady || (!isOnline && !currentPlugin.capabilities.offlineReady)}
          className={`flex-[2] ${paddingClass} ${textClass} rounded-xl font-black uppercase tracking-wider text-white shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            isReady && (isOnline || currentPlugin.capabilities.offlineReady)
              ? `bg-gradient-to-r ${theme.gradient} hover:scale-[1.01] active:scale-99`
              : "opacity-45 bg-slate-850 text-slate-500 cursor-not-allowed border border-white/5"
          }`}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{isFooter ? "Process Queue" : `Process ${toolName}`}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] flex flex-col font-sans select-none overflow-x-hidden relative">
      <style>{`
        .fn-dynamic-filter {
          filter: brightness(${brightness}%) contrast(${contrast}%);
        }
      `}</style>
      <Confetti show={!!resultFile} />

      {/* COMMAND PALETTE COMPONENT */}
      {featureFlags.commandPalette && (
        <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      )}

      {/* HEADER PANEL */}
      <header className="h-14 bg-slate-900/90 border-b border-white/[0.08] backdrop-blur-xl flex items-center justify-between px-4 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${theme.gradient} text-white shadow-lg`}>
              {toolIcon}
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider text-white leading-none">
                {toolName}
              </h1>
              <span className="text-[9px] text-slate-500 leading-none">FileNova Sandbox</span>
            </div>
          </div>
        </div>

        {/* Header Search & Combobox Autocomplete */}
        <div className="hidden md:flex items-center gap-2 relative max-w-xs w-full">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search or Ctrl + K..."
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-9 left-0 right-0 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-1 z-50">
              {searchResults.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setLocation(`/${r.id}`);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-slate-355 hover:text-white text-[11px] font-bold transition flex items-center justify-between cursor-pointer"
                >
                  <span>{r.name}</span>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2.5">
          {recentFiles.length > 0 && (
            <div className="relative group">
              <button 
                title="View recent processed files"
                aria-label="View recent processed files"
                className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Recent</span>
              </button>
              <div className="absolute right-0 top-8 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50">
                <span className="text-[9px] font-black uppercase text-slate-500 px-2 py-1 block">Recently Processed</span>
                <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                  {recentFiles.map((f, i) => (
                    <a
                      key={i}
                      href={f.url}
                      download={f.name}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-slate-355 hover:text-white text-[10px] font-bold block truncate"
                    >
                      <div className="truncate">{f.name}</div>
                      <span className="text-[8px] text-slate-500">{f.time}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSaveSession}
            disabled={!hasFiles}
            className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-355 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
            title="Save workspace file queue"
            aria-label="Save workspace file queue"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Save Session</span>
          </button>

          {/* Polishing: Panic Storage shredder button */}
          <button
            onClick={handlePanicShredder}
            className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-rose-500/20 bg-rose-550/10 hover:bg-rose-600 text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-white transition cursor-pointer flex items-center justify-center animate-pulse-subtle"
            title="Permanently delete all workspace database cache files"
            aria-label="Panic Shredder Purge"
          >
            <span className="hidden md:inline">Shred Cache</span>
            <span className="md:hidden flex items-center justify-center"><Trash2 className="h-3.5 w-3.5" /></span>
          </button>

          <button
            onClick={() => setHelpOpen(prev => !prev)}
            title="Toggle help documentation"
            aria-label="Toggle help documentation"
            className="p-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* HELP INSTRUCTION DRAWER */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-b border-white/[0.08] p-4 text-xs text-slate-400 leading-relaxed"
          >
            <div className="max-w-4xl mx-auto space-y-2">
              <h3 className="font-extrabold text-white text-sm">💡 Quick Guide: {toolName}</h3>
              <p>{toolDescription}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[10px] font-bold font-mono">
                <div>Ctrl + K : Command Palette</div>
                <div>Ctrl + S : Save Session</div>
                <div>Ctrl + Z : Undo Edit</div>
                <div>Ctrl+Shift+Z : Redo Edit</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WORKSPACE PANELS CONTAINER */}
      {!hasFiles ? (
        /* UNIVERSAL UPLOAD HUB EMPTY STATE */
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full">
          <div className="w-full bg-slate-900/40 border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-4">
            <div className="flex justify-center gap-4 text-slate-400 text-xs font-bold mb-2">
              <button title="Upload document" className="flex items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-white/5 hover:bg-slate-800 transition"><Upload className="h-4 w-4 text-indigo-400" /> Upload Any File</button>
              <button title="Take photo from camera" className="flex items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-white/5 hover:bg-slate-800 transition"><Camera className="h-4 w-4 text-emerald-400" /> Camera</button>
              <button title="Paste image from clipboard" className="flex items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-white/5 hover:bg-slate-800 transition"><Clipboard className="h-4 w-4 text-sky-400" /> Paste Image</button>
            </div>

            <h2 className="text-sm font-black uppercase tracking-wider text-slate-350">
              Universal Upload Hub
            </h2>
            <p className="text-xs text-slate-500">Drop PDF, JPG, PNG or DOC files here. FileNova will auto-detect formats & recommend tools.</p>
            
            <FileDropZone
              acceptedTypes={acceptedTypes}
              maxFiles={maxFiles}
              onFilesSelected={handleUniversalUpload}
              accentColor={accentColor}
            />

            {detectedType && (
              <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl space-y-2 text-left animate-fade-up">
                <div className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1">
                  <FileQuestion className="h-4 w-4" /> Detected {detectedType.toUpperCase()} Format
                </div>
                <p className="text-[11px] text-slate-400">Select a recommended action pipeline to process your file:</p>
                <div className="flex gap-2 flex-wrap pt-1">
                  {uploadRecommendations.map(toolId => {
                    const toolObj = TOOL_REGISTRY[toolId];
                    if (!toolObj) return null;
                    return (
                      <button
                        key={toolId}
                        onClick={() => {
                          setLocation(`/${toolId}`);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-white text-[10px] font-black border border-indigo-500/20 transition cursor-pointer"
                      >
                        {toolObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5-PANEL WORKSPACE */
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden h-[calc(100vh-3.5rem)]">
          
          {/* LEFT SIDEBAR (Col span 3) */}
          <aside className="hidden md:flex md:col-span-3 border-r border-white/[0.06] bg-slate-900/20 p-4 flex-col gap-5 overflow-y-auto">
            
            {/* User Projects Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <FolderGit className="h-3.5 w-3.5 text-indigo-400" /> Active Project Sandbox
              </h3>
              
              <div className="flex gap-1.5">
                <select
                  value={currentProject}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  title="Select active user project container"
                  className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {projectsList.map(proj => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddProject(prev => !prev)}
                  className="px-2.5 bg-indigo-650 hover:bg-indigo-550 rounded-xl text-white font-black text-xs cursor-pointer"
                  title="Create new project folder"
                >
                  +
                </button>
              </div>

              {showAddProject && (
                <form onSubmit={handleAddProject} className="flex gap-1.5 animate-fade-up">
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="New project name..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="px-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer">Add</button>
                </form>
              )}
            </div>

            {/* Global File Manager Tabs (Current Queue / Recent / Downloads / Favorites) */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Global File Manager</span>
                <span className="text-[8px] font-mono text-slate-600 bg-slate-950 px-1 py-0.5 rounded uppercase">{activeTab} view</span>
              </h3>

              {/* Tab selector */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5">
                {(["current", "recent", "downloads", "favorites"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[9px] font-black uppercase py-1 rounded-lg transition text-center cursor-pointer ${
                      activeTab === tab 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {tab === "current" ? "Queue" : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content List */}
              <div className="flex-1 overflow-y-auto bg-slate-950/45 border border-white/[0.04] rounded-2xl p-2 space-y-1.5 min-h-[150px] max-h-[250px]">
                {activeTab === "current" ? (
                  files.length === 0 ? (
                    <span className="text-[9px] text-slate-600 block text-center py-6">No files currently in active processing queue.</span>
                  ) : (
                    files.map((f, idx) => (
                      <div key={f.id} className="flex flex-col gap-1 text-[11px] bg-slate-900/50 p-2.5 rounded-xl border border-white/[0.02]">
                        <span className="truncate font-bold text-slate-200">{idx + 1}. {f.name}</span>
                        <span className="text-[9px] font-mono text-slate-500">{formatBytes(f.size)} &bull; {f.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}</span>
                      </div>
                    ))
                  )
                ) : (
                  libraryFiles.length === 0 ? (
                    <span className="text-[9px] text-slate-600 block text-center py-6">No files stored in project sandbox library.</span>
                  ) : (
                    libraryFiles.map((lf) => (
                      <div key={lf.id} className="flex items-center justify-between text-[11px] bg-slate-900/40 p-2 rounded-xl border border-white/[0.02] hover:bg-slate-900/80 transition group">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-bold text-slate-300 block truncate" title={lf.name}>{lf.name}</span>
                          <span className="text-[8.5px] font-mono text-slate-500 block">{formatBytes(lf.size)}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleImportLibraryFile(lf)}
                            title="Load into workspace raw files queue"
                            className="p-1 rounded bg-slate-950 hover:bg-indigo-650 hover:text-white text-indigo-400 cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-current" />
                          </button>
                          <button
                            onClick={() => handleToggleFavoriteFile(lf)}
                            title="Add/remove favorite"
                            className={`p-1 rounded bg-slate-950 hover:bg-amber-600 hover:text-white cursor-pointer ${
                              lf.category === "Favorites" ? "text-amber-400" : "text-slate-500"
                            }`}
                          >
                            <Star className="h-3 w-3 fill-current" />
                          </button>
                          <button
                            onClick={() => handleDownloadLibraryFile(lf)}
                            title="Download file blob"
                            className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteLibraryFile(lf.id)}
                            title="Delete file permanently"
                            className="p-1 rounded bg-slate-950 hover:bg-rose-950 hover:text-rose-400 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Offline Diagnostics Alert Caching Container */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Offline Caching & Sync</h3>
              <div className="p-3 bg-slate-950/80 border border-white/5 rounded-2xl text-[10px] space-y-2 leading-relaxed">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">IndexedDB status:</span>
                  <span className="text-emerald-400 font-black uppercase">Active</span>
                </div>
                
                {/* Phase 4: Database Storage Size Indicators and Warnings */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">Total Cache Size:</span>
                  <span className={`font-mono ${dbSize > 100 * 1024 * 1024 ? "text-rose-400 font-bold" : "text-indigo-300"}`}>
                    {formatBytes(dbSize)}
                  </span>
                </div>

                {dbSize > 100 * 1024 * 1024 && (
                  <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/20 text-rose-405 flex items-start gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400 animate-pulse" />
                    <span>Cache exceeds 100MB. Consider clearing old projects.</span>
                  </div>
                )}
                
                {/* Offline Warnings Block */}
                {!isOnline ? (
                  <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/20 text-red-400 flex items-start gap-1">
                    <CloudOff className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span>Internet offline. Cloud-based conversions will fail until reconnected.</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 flex items-start gap-1">
                    <CloudLightning className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                    <span>Synchronized with cloud server gateway. Offline fallbacks active.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Tools */}
            <div className="space-y-3 mt-auto">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Related Tools</h3>
              <div className="grid grid-cols-1 gap-2">
                {currentPlugin.relatedTools.map(tSlug => {
                  const item = TOOL_REGISTRY[tSlug];
                  if (!item) return null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLocation(`/${item.id}`)}
                      className="w-full p-2.5 rounded-xl border border-white/[0.04] bg-slate-950/60 hover:bg-slate-900 hover:border-indigo-500/20 text-left transition flex items-center gap-2 cursor-pointer"
                    >
                      <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-[10px]">🛠️</div>
                      <div>
                        <span className="text-[10px] font-black block text-slate-355">{item.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* CENTER PANEL (Col span 6) */}
          <main
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            className={`flex-1 md:col-span-6 flex flex-col overflow-y-auto border-r border-white/[0.06] p-4 gap-4 relative transition-colors ${
              isDraggingCanvas ? "bg-indigo-650/15 border-dashed border-2 border-indigo-500 m-2 rounded-3xl" : ""
            }`}
          >
            {/* Toolbar Canvas Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.info("Undone");
                    trackEvent({ tool: slug, action: "undo_click" });
                  }}
                  className="p-1 rounded hover:bg-white/5 transition"
                  title="Undo (Ctrl + Z)"
                  aria-label="Undo"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    toast.info("Redone");
                    trackEvent({ tool: slug, action: "redo_click" });
                  }}
                  className="p-1 rounded hover:bg-white/5 transition"
                  title="Redo (Ctrl + Shift + Z)"
                  aria-label="Redo"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => setZoom(z => Math.max(50, z - 25))}
                  className="p-1 rounded hover:bg-white/5 transition"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-[9.5px] font-bold">{zoom}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(200, z + 25))}
                  className="p-1 rounded hover:bg-white/5 transition"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Offline vs cloud diagnostic compatibility badges */}
              <div className="flex items-center gap-2">
                {currentPlugin.capabilities.offlineReady ? (
                  <span className="text-[9.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="hidden md:inline">Offline Enabled (Secure Local Processing)</span>
                    <span className="md:hidden">Offline Secure</span>
                  </span>
                ) : (
                  <span className="text-[9.5px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    <span className="hidden md:inline">Cloud API Required</span>
                    <span className="md:hidden">Cloud API</span>
                  </span>
                )}
              </div>

              {/* Mobile settings scroll shortcut */}
              {hasFiles && (
                <button
                  onClick={() => settingsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="md:hidden px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black uppercase text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Settings2 className="h-3.5 w-3.5 text-indigo-400 animate-spin-slow" />
                  <span>Settings</span>
                </button>
              )}
            </div>

            {/* Phase 2: Workflow Pipeline Stepper */}
            {featureFlags.workflowEngine && (
              <div className="w-full bg-slate-950/60 border border-white/[0.04] p-3 rounded-2xl backdrop-blur flex items-center justify-between text-[10.5px]">
                <span className="text-[9px] font-black uppercase text-slate-500 select-none shrink-0 pr-2 border-r border-white/5">Workflow Queue</span>
                <div className="flex-1 flex items-center justify-around px-2 min-w-0">
                  {getPipelineSteps().map((step, idx) => (
                    <React.Fragment key={step.id}>
                      {idx > 0 && (
                        <div className={`flex-1 h-0.5 mx-2 max-w-[40px] border-t-2 border-dashed ${
                          step.status === "pending" ? "border-white/5" : "border-indigo-500/40"
                        }`} />
                      )}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 border ${
                          step.status === "done" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500" :
                          step.status === "active" ? "bg-indigo-650 text-white border-indigo-500 animate-pulse" :
                          "bg-slate-900 text-slate-600 border-white/5"
                        }`}>
                          {step.status === "done" ? "✓" : idx + 1}
                        </div>
                        <span className={`truncate font-bold select-none ${
                          step.status === "active" ? "text-indigo-400 inline" : 
                          step.status === "done" ? "text-slate-300 hidden md:inline" : "text-slate-600 hidden md:inline"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* DECOUPLED COMPONENT REGISTRY RENDER WITH BRIGHTNESS/CONTRAST FILTERS */}
            <div 
              className={`flex-1 flex flex-col items-center justify-center p-1 relative overflow-hidden bg-slate-950/30 rounded-3xl border border-white/[0.05] transition-all duration-200 ${filterClassName} flex`}
            >
              <WorkspaceComponent
                files={files}
                configPanel={configPanel}
                onReset={onReset}
                onProcess={onProcess}
                isReady={isReady}
                isProcessing={isProcessing}
                previewPanel={
                  resultFile ? (
                    <div className="w-full space-y-4">
                      {/* One-click Continue Workflow Banner */}
                      {featureFlags.workflowEngine && (
                        <div className="p-4 bg-slate-900 border border-indigo-500/25 rounded-2xl flex items-center justify-between text-xs animate-fade-up">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                            <div>
                              <span className="font-black text-white block">Workflow Engine Suggested Step</span>
                              <span className="text-[10px] text-slate-400">Next suggested tool: {TOOL_REGISTRY[getRecommendedTools()[0]]?.name || "Compress PDF"}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleContinueWorkflow(getRecommendedTools()[0] || "compress-pdf")}
                            className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white font-black text-[10.5px] uppercase tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            Continue Pipeline <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <ExportCenter
                        fileName={resultFile.name}
                        fileSize={resultFile.size}
                        downloadUrl={resultFile.url}
                        onSaveSession={handleSaveSession}
                      />
                    </div>
                  ) : currentPlugin.capabilities.beforeAfter && featureFlags.beforeAfterSlider ? (
                    <BeforeAfterSlider
                      beforeTitle="Raw Input Document"
                      afterTitle={`${toolName} Compiled Output`}
                      beforeContent={previewPanel}
                      afterContent={
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse mb-2" />
                          <span className="font-bold text-[11px]">Ready for export processing</span>
                        </div>
                      }
                    />
                  ) : (
                    previewPanel
                  )
                }
              />
            </div>

            {/* MOBILE ONLY ADJUSTMENT SETTINGS & EDITING OPTIONS SECTION */}
            {hasFiles && (
              <div ref={settingsRef} className="md:hidden space-y-5 border-t border-white/[0.08] pt-5 mt-2 text-left w-full animate-fade-up">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Adjustment Settings</h3>
                  </div>
                  <button
                    onClick={() => {
                      const mainEl = settingsRef.current?.closest('main');
                      if (mainEl) {
                        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="text-[9px] px-2.5 py-1 bg-slate-950 border border-white/10 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    ↑ Back to Preview
                  </button>
                </div>

                {/* Output Filename Configuration Card */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Output Settings</h4>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span>Output Filename</span>
                        {!premiumEnabled && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                            🔒 Premium Lock
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={!premiumEnabled}
                        value={premiumEnabled ? customFileName : getBrandedFileName(slug, getOutputExtensionForSlug(slug, files))}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        title="Output Filename"
                        placeholder="Custom output filename"
                        className={`w-full bg-slate-950/60 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                          premiumEnabled 
                            ? "border-white/10 focus:border-indigo-500" 
                            : "border-white/5 text-slate-555 cursor-not-allowed select-none bg-slate-950/30 font-medium"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Tool-Specific Config Panel */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Adjustment Parameters</h4>
                  <div className={`p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-4 ${isProcessing ? "opacity-45 pointer-events-none" : ""}`}>
                    {configPanel}
                    
                    {/* Mobile Inline Action Button */}
                    <div className="border-t border-white/5 pt-3">
                      {renderPrimaryActionButton(false)}
                    </div>
                  </div>
                </div>

                {/* Image Local Enhancements Slider panel */}
                {(currentPlugin.category === "image" || currentPlugin.category === "ocr") && (
                  <div className="space-y-3 p-4 bg-slate-950/60 border border-white/[0.05] rounded-2xl">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-indigo-400">
                      <span>Local Enhancements</span>
                      <button onClick={() => { setBrightness(100); setContrast(100); }} className="text-[9px] text-slate-500 hover:text-indigo-400 transition cursor-pointer">Reset All</button>
                    </div>
                    <div className="space-y-3 text-[10px] font-bold">
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Brightness: {brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          title="Adjust Brightness"
                          placeholder="Brightness percentage"
                          className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Contrast: {contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          title="Adjust Contrast"
                          placeholder="Contrast percentage"
                          className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Next Steps */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Recommended Next Steps</h4>
                  <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-3 space-y-2">
                    {getRecommendedTools().map(toolId => {
                      const targetTool = TOOL_REGISTRY[toolId];
                      if (!targetTool) return null;
                      return (
                        <button
                          key={toolId}
                          onClick={() => setLocation(`/${toolId}`)}
                          className="w-full p-2.5 rounded-xl border border-white/[0.04] bg-slate-950/60 hover:bg-slate-900 hover:border-indigo-500/20 text-left transition flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-[10px] font-black text-slate-355">{targetTool.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy & Audits */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setPrivacyModalOpen(true)}
                    className="w-full p-3 border border-white/[0.06] rounded-2xl bg-slate-950/80 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Privacy & Audits</span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </button>
                </div>
              </div>
            )}

            <div className="text-center text-[10px] text-slate-500 font-bold border border-dashed border-white/5 p-3 rounded-2xl bg-slate-900/20 animate-pulse">
              Drag additional files here to append to document queue. Maximum files: {maxFiles}
            </div>
          </main>
          <aside className="hidden md:flex md:col-span-3 border-l border-white/[0.06] bg-slate-900/20 p-4 flex-col gap-5 overflow-y-auto">
            {/* Output Filename Configuration Card */}
            {hasFiles && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Output Settings</h3>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <span>Output Filename</span>
                      {!premiumEnabled && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                          🔒 Premium Lock
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        disabled={!premiumEnabled}
                        value={premiumEnabled ? customFileName : getBrandedFileName(slug, getOutputExtensionForSlug(slug, files))}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        placeholder={
                          files[0]?.name 
                            ? `${files[0].name.replace(/\.[^/.]+$/, "")}_processed` 
                            : "e.g. customized-output"
                        }
                        className={`w-full bg-slate-950/60 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                          premiumEnabled 
                            ? "border-white/10 focus:border-indigo-500" 
                            : "border-white/5 text-slate-555 cursor-not-allowed select-none bg-slate-950/30 font-medium"
                        }`}
                      />
                    </div>
                    {!premiumEnabled && (
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Free users output is branding-locked to <span className="font-mono text-slate-400 font-bold">{getBrandedFileName(slug, getOutputExtensionForSlug(slug, files))}</span>. Upgrade to Pro to customize output names.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Tool-Specific Config Panel */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Adjustment Parameters</h3>
              <div className={`p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-4 ${isProcessing ? "opacity-45 pointer-events-none" : ""}`}>
                {configPanel}
                
                {/* Desktop Inline Action Button */}
                <div className="border-t border-white/5 pt-3">
                  {renderPrimaryActionButton(false)}
                </div>
              </div>
            </div>

            {/* Polishing: Image Local Enhancements Slider panel */}
            {(currentPlugin.category === "image" || currentPlugin.category === "ocr") && (
              <div className="space-y-3 p-4 bg-slate-950/60 border border-white/[0.05] rounded-2xl animate-fade-up">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                  Local Enhancements
                </span>
                <div className="space-y-3 text-[10px] font-bold">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Brightness: {brightness}%</span>
                      <button onClick={() => setBrightness(100)} className="text-[9px] text-slate-500 hover:text-indigo-400 transition cursor-pointer">Reset</button>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      title="Adjust Brightness"
                      placeholder="Brightness percentage"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Contrast: {contrast}%</span>
                      <button onClick={() => setContrast(100)} className="text-[9px] text-slate-500 hover:text-indigo-400 transition cursor-pointer">Reset</button>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      title="Adjust Contrast"
                      placeholder="Contrast percentage"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Smart Context Panel */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Recommended Next Steps</h3>
              <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-3 space-y-2">
                {getRecommendedTools().map(toolId => {
                  const targetTool = TOOL_REGISTRY[toolId];
                  if (!targetTool) return null;
                  return (
                    <button
                      key={toolId}
                      onClick={() => setLocation(`/${toolId}`)}
                      className="w-full p-2.5 rounded-xl border border-white/[0.04] bg-slate-950/60 hover:bg-slate-900 hover:border-indigo-500/20 text-left transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[10px] font-black text-slate-355">{targetTool.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy tab shortcut */}
            <div className="space-y-3 mt-auto">
              <button
                onClick={() => setPrivacyModalOpen(true)}
                className="w-full p-3 border border-white/[0.06] rounded-2xl bg-slate-950/80 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Privacy & Audits</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MOBILE DRAWER BOTTOM SHEET (Parameters config panel) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center md:hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-h-[70vh] bg-slate-900 border-t border-white/10 rounded-t-3xl p-5 overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-250">Adjustment Settings</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-[10px] font-bold text-slate-300 cursor-pointer"
                >
                  Done
                </button>
              </div>

              {hasFiles && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <span>Output Filename</span>
                      {!premiumEnabled && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                          🔒 Premium Lock
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        disabled={!premiumEnabled}
                        value={premiumEnabled ? customFileName : getBrandedFileName(slug, getOutputExtensionForSlug(slug, files))}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        placeholder={
                          files[0]?.name 
                            ? `${files[0].name.replace(/\.[^/.]+$/, "")}_processed` 
                            : "e.g. customized-output"
                        }
                        className={`w-full bg-slate-950/60 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                          premiumEnabled 
                            ? "border-white/10 focus:border-indigo-500" 
                            : "border-white/5 text-slate-555 cursor-not-allowed select-none bg-slate-950/30 font-medium"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="py-2">
                {configPanel}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* BOTTOM PANEL - Processing status and timeline logs */}
      {hasFiles && (
        <footer className="h-auto md:h-28 bg-[#090d16] border-t border-white/[0.08] flex flex-col md:grid md:grid-cols-12 z-30 sticky bottom-0">
          
          {/* Timeline processing logs */}
          <div className="hidden md:flex md:col-span-8 border-r border-white/[0.06] p-3 flex-col overflow-y-auto">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Timeline Ticker Logs</span>
            <div className="space-y-0.5 font-mono text-[9px] text-slate-400">
              {timelineLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className="truncate">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats, Health Monitoring and Action Bar */}
          <div className="col-span-12 md:col-span-4 p-3 flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
                <span>Operational Health</span>
                <span className="text-emerald-400">99.8% Online</span>
              </div>
              
              {/* Kiosk guidelines compliance tips ticker */}
              <div className="text-[9.5px] font-bold text-indigo-400 animate-pulse truncate block">
                💡 {COMPLIANCE_TIPS[tipIndex]}
              </div>
            </div>

            {renderPrimaryActionButton(true)}
          </div>
        </footer>
      )}

      {/* PRIVACY MODAL */}
      <AnimatePresence>
        {privacyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full relative">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                title="Close privacy modal"
                aria-label="Close privacy modal"
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
              >
                close
              </button>
              <PrivacyDashboard />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolWorkspace;
