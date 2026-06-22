import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, RefreshCw, Sparkles, AlertCircle, Search, Save, HelpCircle,
  Undo2, Redo2, ZoomIn, ZoomOut, Activity, Info, Calendar,
  ChevronRight, Download, Trash2, Play, CheckCircle2, Shield, Eye, Settings2, Clock, Upload, Camera, Clipboard, FileQuestion, FolderGit, AlertTriangle, Star, CheckCircle, FileText, CloudOff, CloudLightning, Settings, Sliders
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
import { ProcessingBadge } from "./ProcessingBadge";
import { toast } from "sonner";
import { fileDatabase, DBFileRecord } from "@/lib/fileDatabase";
import { analytics } from "@/lib/analytics";
import { getBrandedFileName, getExtensionForMime, getOutputExtensionForSlug } from "@/hooks/useToolProcessor";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ProjectLibrarySidebar } from "./ProjectLibrarySidebar";
import { WorkspaceUploadHub } from "./WorkspaceUploadHub";
import { WorkspaceFooter } from "./WorkspaceFooter";

export interface ToolWorkspaceStat {
  label: string;
  value: string;
  tone?: "default" | "success" | "info";
}

export interface ToolControl {
  id: string;
  label: string;
  type: "slider" | "toggle" | "dropdown" | "input" | "preset-grid" | "radio-cards" | "custom-target-size";
  icon?: React.ReactNode;
  value: any;
  onChange: (val: any) => void;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any; desc?: string; quality?: string }[];
  placeholder?: string;
  advanced?: boolean;
  unit?: string;
  description?: string;
  inputType?: string;
}

export interface ToolWorkspaceProps {
  toolName: string;
  toolDescription: string;
  toolIcon: React.ReactNode;
  accentColor: string;
  configPanel?: React.ReactNode;
  previewPanel: React.ReactNode;
  onProcess: () => Promise<void>;
  isProcessing: boolean;
  isUploading?: boolean;
  progress?: number;
  isReady: boolean;
  resultFile?: { name: string; url: string; size: string; savings?: string; warning?: string; processingTime?: number } | null;
  onReset: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  onFilesSelected: (files: File[]) => void;
  files: FileRecord[];
  error?: string | null;

  // Bento config-driven options
  controlsConfig?: ToolControl[];
  statusPanel?: React.ReactNode;
  stats?: ToolWorkspaceStat[];
  processingStatus?: string;
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

export const COMPLIANCE_TIPS = [
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
  isUploading = false,
  progress = 0,
  isReady,
  resultFile,
  onReset,
  maxFiles = 1,
  acceptedTypes = ["*"],
  onFilesSelected,
  files,
  error,
  controlsConfig,
  statusPanel,
  stats,
  processingStatus,
}) => {
  const [location, setLocation] = useLocation();
  const slug = location.replace(/^\//, "");
  const { premiumTier, premiumEnabled } = useSubscription();
  const { customFileName, setCustomFileName } = useFileStore();
  const settingsRef = useRef<HTMLDivElement>(null);

  // Bento Collapsible Sidebar & Accordion states
  const [sidebarOpen, setSidebarOpen] = useState(false); // default collapsed on PC to maximize bento space
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Logs panel state — collapsed by default to save vertical space
  const [logsOpen, setLogsOpen] = useState(false);

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
          className={`w-full ${paddingClass} ${textClass} bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-xl font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5`}
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

  const renderControl = (ctrl: any) => {
    switch (ctrl.type) {
      case "preset-grid":
        return (
          <div key={ctrl.id} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              {ctrl.icon}
              {ctrl.label}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ctrl.options?.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => ctrl.onChange(opt.value)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-22 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                    ctrl.value === opt.value
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg text-white"
                      : "border-white/[0.06] bg-slate-950/45 hover:bg-slate-900/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase tracking-wider truncate">{opt.label}</span>
                    {ctrl.value === opt.value && <CheckCircle2 className="h-3 w-3 text-indigo-400" />}
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-medium leading-none truncate">{opt.desc}</p>
                    {opt.quality && <p className="text-[8px] text-slate-500 font-mono mt-1">{opt.quality}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case "toggle":
        return (
          <label key={ctrl.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/45 border border-white/[0.04] cursor-pointer hover:bg-slate-900/40 transition">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              {ctrl.icon}
              <span>{ctrl.label}</span>
            </div>
            <input
              type="checkbox"
              checked={ctrl.value}
              onChange={(e) => ctrl.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </label>
        );
      case "dropdown":
        return (
          <div key={ctrl.id} className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              {ctrl.icon}
              {ctrl.label}
            </label>
            <select
              value={ctrl.value}
              onChange={(e) => ctrl.onChange(e.target.value)}
              title={ctrl.label}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
            >
              {ctrl.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      case "slider":
        return (
          <div key={ctrl.id} className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1">{ctrl.icon}{ctrl.label}</span>
              <span className="font-mono text-indigo-400">{ctrl.value}{ctrl.unit || ""}</span>
            </div>
            <input
              type="range"
              min={ctrl.min ?? 0}
              max={ctrl.max ?? 100}
              step={ctrl.step ?? 1}
              value={ctrl.value}
              onChange={(e) => ctrl.onChange(Number(e.target.value))}
              title={ctrl.label}
              placeholder={ctrl.placeholder || ctrl.label}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        );
      case "input":
        return (
          <div key={ctrl.id} className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              {ctrl.icon}
              {ctrl.label}
            </label>
            <div className="flex gap-2">
              <input
                type={ctrl.inputType || "text"}
                value={ctrl.value}
                onChange={(e) => ctrl.onChange(e.target.value)}
                placeholder={ctrl.placeholder}
                title={ctrl.label}
                className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              {ctrl.unit && (
                <span className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                  {ctrl.unit}
                </span>
              )}
            </div>
            {ctrl.description && <p className="text-[9px] text-slate-500 leading-normal">{ctrl.description}</p>}
          </div>
        );
      case "radio-cards":
        return (
          <div key={ctrl.id} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1" id={`label-${ctrl.id}`}>
              {ctrl.icon}
              {ctrl.label}
            </label>
            <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby={`label-${ctrl.id}`}>
              {ctrl.options?.map((opt: any) => {
                const isSelected = ctrl.value === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                        : "border-white/[0.06] bg-slate-950/45 hover:bg-slate-900/60 text-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={ctrl.id}
                      checked={isSelected}
                      onChange={() => ctrl.onChange(opt.value)}
                      className="sr-only"
                    />
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-white/20"
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold leading-tight">{opt.label}</span>
                      {opt.desc && <span className="text-[10px] text-slate-500 leading-normal mt-0.5">{opt.desc}</span>}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      case "custom-target-size": {
        const { targetSize, targetSizeUnit, autoAdjust = true } = ctrl.value || { targetSize: "1500", targetSizeUnit: "MB", autoAdjust: true };
        const kbVal = parseInt(targetSize) || 200;
        const maxMb = ctrl.max || 4.8;
        const minMb = ctrl.min || 0.2;

        const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const val = parseFloat(e.target.value);
          let newKb = 200;
          if (targetSizeUnit === "MB") {
            newKb = Math.round(val * 1024);
          } else {
            newKb = Math.round(val);
          }
          ctrl.onChange({ targetSize: String(newKb), targetSizeUnit, autoAdjust });
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const rawInput = e.target.value;
          const val = parseFloat(rawInput) || 0;
          let newKb = 200;
          if (targetSizeUnit === "MB") {
            newKb = Math.round(val * 1024);
          } else {
            newKb = Math.round(val);
          }
          
          const maxKb = Math.round(maxMb * 1024);
          const minKb = Math.round(minMb * 1024);
          const clampedKb = Math.max(minKb, Math.min(maxKb, newKb));
          
          ctrl.onChange({ targetSize: String(clampedKb), targetSizeUnit, autoAdjust });
        };

        const handleUnitChange = (newUnit: "MB" | "KB") => {
          ctrl.onChange({ targetSize, targetSizeUnit: newUnit, autoAdjust });
        };

        const handleCheckboxChange = (checked: boolean) => {
          ctrl.onChange({ targetSize, targetSizeUnit, autoAdjust: checked });
        };

        const sMin = targetSizeUnit === "MB" ? minMb : Math.round(minMb * 1024);
        const sMax = targetSizeUnit === "MB" ? maxMb : Math.round(maxMb * 1024);
        const sStep = targetSizeUnit === "MB" ? 0.1 : 10;
        const sVal = targetSizeUnit === "MB" ? parseFloat((kbVal / 1024).toFixed(2)) : kbVal;

        const formattedDisplayStr = targetSizeUnit === "MB" 
          ? `${(kbVal / 1024).toFixed(1)} MB` 
          : `${kbVal} KB`;

        return (
          <div key={ctrl.id} className="p-4 rounded-xl bg-slate-950/60 border border-blue-500/20 space-y-4 shadow-[0_0_15px_rgba(59,130,246,0.05)] transition-all duration-300 hover:scale-[1.005] hover:shadow-lg">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-300">
              <span>{ctrl.label}</span>
              <span className="font-mono text-blue-400 text-[13px]">{formattedDisplayStr}</span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min={sMin}
                max={sMax}
                step={sStep}
                value={sVal}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title="Target size slider"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>{targetSizeUnit === "MB" ? `${minMb} MB` : `${Math.round(minMb * 1024)} KB`}</span>
                <span>{targetSizeUnit === "MB" ? `${maxMb} MB` : `${Math.round(maxMb * 1024)} KB`}</span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="number"
                  step={sStep}
                  value={targetSizeUnit === "MB" ? parseFloat((kbVal / 1024).toFixed(2)) : kbVal}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. 1.5"
                  title="Target size input"
                />
              </div>
              
              <div className="relative">
                <select
                  value={targetSizeUnit}
                  onChange={(e) => handleUnitChange(e.target.value as any)}
                  title="Target size unit selection"
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold appearance-none pr-8 cursor-pointer"
                >
                  <option value="MB">MB</option>
                  <option value="KB">KB</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="h-3 w-3 rotate-90" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-semibold text-slate-400 select-none hover:text-slate-300 transition">
              <input
                type="checkbox"
                checked={autoAdjust}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/10 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Quality auto-adjusts to hit this size</span>
            </label>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderSettingsSidebarContent = () => {
    if (controlsConfig && controlsConfig.length > 0) {
      const coreControls = controlsConfig.filter(c => !c.advanced);
      const advancedControls = controlsConfig.filter(c => c.advanced);

      return (
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1">Tool Settings</h3>
            <p className="text-[10px] text-slate-500 font-medium">Configure parameters for {toolName}.</p>
          </div>

          {/* Core Controls */}
          <div className="space-y-4">
            {coreControls.map(renderControl)}
          </div>

          {/* Advanced Controls Accordion */}
          {advancedControls.length > 0 && (
            <div className="border-t border-white/5 pt-4 space-y-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition cursor-pointer"
              >
                <span>Advanced Parameters</span>
                <span className={`transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 pt-1"
                  >
                    {advancedControls.map(renderControl)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      );
    }

    return configPanel;
  };

  const renderStatStrip = () => {
    if (files.length === 0) return null;

    const renderCard = (label: string, value: string, tone?: "default" | "success" | "info", idx?: number) => {
      let toneClasses = "text-white border-white/10 dark:border-white/10 bg-slate-900/10";
      if (tone === "success") {
        toneClasses = "text-emerald-400 border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]";
      } else if (tone === "info") {
        toneClasses = "text-blue-400 border-blue-500/20 dark:border-blue-500/20 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.05)]";
      }

      return (
        <div 
          key={idx !== undefined ? idx : label} 
          className={`glass border rounded-2xl p-4 shadow-soft flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 ${toneClasses}`}
        >
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{label}</span>
          <span className="text-sm font-black mt-1.5 font-mono truncate">{value}</span>
        </div>
      );
    };

    if (stats && stats.length > 0) {
      return (
        <div className="grid grid-cols-3 gap-4 shrink-0">
          {stats.map((s, idx) => renderCard(s.label, s.value, s.tone, idx))}
        </div>
      );
    }

    const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
    return (
      <div className="grid grid-cols-3 gap-4 shrink-0">
        {renderCard("Original Size", formatBytes(totalSizeBytes), "default")}
        {renderCard("Queue Size", `${files.length} ${files.length === 1 ? 'file' : 'files'}`, "info")}
        {renderCard("Status", resultFile ? "Done" : "Ready", resultFile ? "success" : "default")}
      </div>
    );
  };

  return (
    <div className="min-h-screen max-h-screen bg-background text-foreground flex flex-col font-sans select-none overflow-hidden relative">
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
      <WorkspaceHeader
        toolName={toolName}
        toolIcon={toolIcon}
        accentColor={accentColor}
        hasFiles={hasFiles}
        recentFiles={recentFiles}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        onSearchSelect={(id) => {
          setLocation(`/${id}`);
          setSearchQuery("");
          setSearchResults([]);
        }}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onSaveSession={handleSaveSession}
        onPanicShredder={handlePanicShredder}
        helpOpen={helpOpen}
        onToggleHelp={() => setHelpOpen(prev => !prev)}
      />

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
        <WorkspaceUploadHub
          acceptedTypes={acceptedTypes}
          maxFiles={maxFiles}
          onFilesSelected={handleUniversalUpload}
          accentColor={accentColor}
          detectedType={detectedType}
          uploadRecommendations={uploadRecommendations}
        />
      ) : (
        /* BENTO GRID WORKSPACE - fits full viewport, no scroll needed */
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem - 4.5rem)' }}>
          
          {/* LEFT SIDEBAR - Collapsible (spans width on desktop, slides in) */}
          <AnimatePresence>
            {sidebarOpen && (
              <ProjectLibrarySidebar
                currentProject={currentProject}
                projectsList={projectsList}
                showAddProject={showAddProject}
                newProjectName={newProjectName}
                activeTab={activeTab}
                files={files}
                libraryFiles={libraryFiles}
                dbSize={dbSize}
                isOnline={isOnline}
                formatBytes={formatBytes}
                onProjectChange={handleProjectChange}
                onToggleAddProject={() => setShowAddProject(prev => !prev)}
                onNewProjectNameChange={setNewProjectName}
                onAddProject={handleAddProject}
                onActiveTabChange={setActiveTab}
                onImportLibraryFile={handleImportLibraryFile}
                onToggleFavoriteFile={handleToggleFavoriteFile}
                onDownloadLibraryFile={handleDownloadLibraryFile}
                onDeleteLibraryFile={handleDeleteLibraryFile}
              />
            )}
          </AnimatePresence>

          {/* MAIN BENTO GRID WORKSPACE */}
          <div className="flex-1 p-3 lg:p-4 bg-background/30 flex flex-col gap-3 h-full overflow-hidden">
            {/* Upload progress bar — absolute positioned for visibility */}
            {isUploading && (
              <div className="absolute top-0 left-0 w-full z-50 px-4 pt-2">
                <Progress value={progress} className="h-1 bg-slate-800" />
                <p className="text-[9px] text-center text-slate-500 mt-0.5 font-mono">Uploading file...</p>
              </div>
            )}

            {/* MAIN BENTO GRID: preview + settings side by side */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
              
              {/* LEFT COLUMN: Preview + Stats Strip (65%) */}
              <div className="col-span-1 lg:col-span-8 flex flex-col gap-3 order-1 lg:order-none min-h-0">
                {/* Bento Primary Cell: Preview & Upload */}
                <div 
                  className={`flex-1 flex flex-col min-h-[45vh] lg:min-h-0 bg-slate-900/10 glass border rounded-2xl p-4 shadow-soft transition-all duration-300 hover:scale-[1.002] hover:shadow-premium relative overflow-hidden ${
                    isDraggingCanvas || files.length > 0
                      ? "border-blue-500/50 ring-2 ring-blue-500/10"
                      : "border-white/10"
                  }`}
                  onDragOver={handleCanvasDragOver}
                  onDragLeave={handleCanvasDragLeave}
                  onDrop={handleCanvasDrop}
                >
                  {/* Toolbar Canvas Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs text-slate-400 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          toast.info("Undone");
                          trackEvent({ tool: slug, action: "undo_click" });
                        }}
                        className="p-1 rounded hover:bg-white/5 transition cursor-pointer"
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
                        className="p-1 rounded hover:bg-white/5 transition cursor-pointer"
                        title="Redo (Ctrl + Shift + Z)"
                        aria-label="Redo"
                      >
                        <Redo2 className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => setZoom(z => Math.max(50, z - 25))}
                        className="p-1 rounded hover:bg-white/5 transition cursor-pointer"
                        title="Zoom Out"
                        aria-label="Zoom Out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-[9.5px] font-bold">{zoom}%</span>
                      <button
                        onClick={() => setZoom(z => Math.min(200, z + 25))}
                        className="p-1 rounded hover:bg-white/5 transition cursor-pointer"
                        title="Zoom In"
                        aria-label="Zoom In"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>

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
                  </div>

                  {/* Phase 2: Workflow Pipeline Stepper */}
                  {featureFlags.workflowEngine && (
                    <div className="w-full bg-slate-950/60 border border-white/[0.04] p-2.5 rounded-xl backdrop-blur flex items-center justify-between text-[10.5px] mt-2.5 shrink-0">
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
                                step.status === "active" ? "bg-indigo-600 text-white border-indigo-500 animate-pulse" :
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

                  {/* Decoupled Component Render Frame */}
                  <div 
                    className={`flex-1 flex flex-col items-center justify-center p-2 relative overflow-hidden bg-slate-950/30 rounded-xl border border-white/[0.04] mt-2.5 transition-all duration-200 ${filterClassName} flex min-h-0`}
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
                            {/* Unachievable target warning banner */}
                            {resultFile.warning && (
                              <div className="p-3.5 bg-amber-550/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-300 animate-fade-up">
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-white block">Compression Notice</span>
                                  <span>{resultFile.warning}</span>
                                </div>
                              </div>
                            )}

                            {/* One-click Continue Workflow Banner */}
                            {featureFlags.workflowEngine && (
                              <div className="p-4 bg-slate-900 border border-indigo-500/25 rounded-2xl flex items-center justify-between text-xs animate-fade-up">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse animate-pulse-subtle" />
                                  <div>
                                    <span className="font-black text-white block">Workflow Suggested Step</span>
                                    <span className="text-[10px] text-slate-400">Next suggested tool: {TOOL_REGISTRY[getRecommendedTools()[0]]?.name || "Compress PDF"}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleContinueWorkflow(getRecommendedTools()[0] || "compress-pdf")}
                                  className="px-3.5 py-1.5 bg-indigo-655 hover:bg-indigo-600 rounded-xl text-white font-black text-[10.5px] uppercase tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-md"
                                >
                                  Continue Pipeline <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                            )}

                            {/* Processing Speed & Privacy Badge */}
                            {resultFile.processingTime && (
                              <ProcessingBadge
                                durationSeconds={resultFile.processingTime}
                                isLocalOnly={currentPlugin.capabilities.offlineReady}
                                toolName={toolName}
                              />
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

                  <div className="text-center text-[9px] text-slate-500 font-bold border border-dashed border-white/5 p-2 rounded-xl bg-slate-900/20 animate-pulse mt-2.5 shrink-0">
                    Drag additional files here to append to document queue. Maximum files: {maxFiles}
                  </div>
                </div>

                {/* Stat Strip Cell — below preview, always visible */}
                {renderStatStrip()}
              </div>

              {/* RIGHT COLUMN: Settings Sidebar (35%) */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-3 order-3 lg:order-none min-h-0 overflow-y-auto">
                {/* Bento Settings Sidebar Cell */}
                <div className="glass border border-white/10 rounded-2xl p-4 shadow-soft flex flex-col gap-3 overflow-y-auto flex-1">
                  
                  {/* Desktop Sidebar Layout */}
                  <div className="hidden lg:flex flex-col gap-4">
                    {/* Output Filename configuration card */}
                    {hasFiles && (
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.05] space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
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
                                : "border-white/5 text-slate-500 cursor-not-allowed select-none bg-slate-950/30 font-medium"
                            }`}
                          />
                        </div>
                        {!premiumEnabled && (
                          <p className="text-[9px] text-slate-500 leading-normal">
                            Upgrade to Pro to customize output names.
                          </p>
                        )}
                      </div>
                    )}

                    {renderSettingsSidebarContent()}

                    {/* Desktop Local Image Enhancements */}
                    {(currentPlugin.category === "image" || currentPlugin.category === "ocr") && (
                      <div className="p-4 bg-slate-950/60 border border-white/[0.05] rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-indigo-400">
                          <span>Local Enhancements</span>
                          <button onClick={() => { setBrightness(100); setContrast(100); }} className="text-[9px] text-slate-500 hover:text-indigo-400 transition cursor-pointer">Reset</button>
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

                    {/* Privacy Banner link */}
                    <button
                      onClick={() => setPrivacyModalOpen(true)}
                      className="w-full p-3 border border-white/[0.06] rounded-xl bg-slate-950/80 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-200">Privacy & Audits</span>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </button>
                  </div>

                  {/* Mobile Accordion Settings Wrapper */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
                      className="w-full p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-indigo-400" />
                        <span>Adjustment Parameters & Settings</span>
                      </div>
                      <span className={`transition-transform duration-300 ${mobileSettingsOpen ? "rotate-90" : ""}`}>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {mobileSettingsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3 space-y-4 text-left"
                        >
                          {/* Output Filename configuration card */}
                          {hasFiles && (
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.05] space-y-3">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                                  <span>Output Filename</span>
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
                                      : "border-white/5 text-slate-500 cursor-not-allowed select-none bg-slate-950/30 font-medium"
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          {renderSettingsSidebarContent()}

                          {/* Local enhancements sliders */}
                          {(currentPlugin.category === "image" || currentPlugin.category === "ocr") && (
                            <div className="p-4 bg-slate-950/60 border border-white/[0.05] rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-indigo-400">
                                <span>Local Enhancements</span>
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Status/Info Cell — compact, below settings */}
                <div className="glass border border-white/10 rounded-2xl p-3 shadow-soft shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between w-full border-b border-white/5 pb-1 mb-2">
                    <span>Status Info</span>
                    <span className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-blue-400 animate-pulse' : isUploading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 text-xs w-full">
                    {statusPanel ? (
                      statusPanel
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/[0.02]">
                          <span className="text-slate-400 font-bold">Process State</span>
                          <span className="font-mono font-extrabold text-white">
                            {isUploading ? "Uploading..." : isProcessing ? (processingStatus || "Processing...") : (resultFile ? "Complete" : "Ready")}
                          </span>
                          <span className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1.5 text-xs w-full">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/[0.02]">
                            <span className="text-slate-400 font-bold">Files</span>
                            <span className="font-mono font-extrabold text-white">{files.length}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/[0.02]">
                            <span className="text-slate-400 font-bold">Size</span>
                            <span className="font-mono font-extrabold text-white">
                              {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
                            </span>
                          </div>
                        </div>

                        {/* Privacy badge in settings panel */}
                        <button
                          onClick={() => setPrivacyModalOpen(true)}
                          className="w-full p-2.5 border border-emerald-500/20 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 transition flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[9px] font-bold text-emerald-400 text-left leading-tight">100% local processing — files never leave your browser</span>
                        </button>

                        {/* Collapsible logs */}
                        <button
                          onClick={() => setLogsOpen(o => !o)}
                          className="flex items-center justify-between w-full text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-300 transition cursor-pointer pt-1"
                        >
                          <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Timeline Logs</span>
                          <ChevronRight className={`h-3 w-3 transition-transform ${logsOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {logsOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-0.5 font-mono text-[8.5px] text-slate-400 max-h-28 overflow-y-auto bg-slate-950/60 rounded-xl p-2">
                                {timelineLogs.slice(-8).map((log, i) => (
                                  <div key={i} className="flex gap-2">
                                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                    <span className="truncate">{log.text}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
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
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer"
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
                            : "border-white/5 text-slate-500 cursor-not-allowed select-none bg-slate-950/30 font-medium"
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
        <WorkspaceFooter
          isProcessing={isProcessing}
          progress={progress}
          resultFile={resultFile}
          tipIndex={tipIndex}
          onReset={onReset}
          onProcess={onProcess}
          isReady={isReady}
          isOnline={isOnline}
          offlineReady={currentPlugin.capabilities.offlineReady}
          theme={theme}
          toolName={toolName}
        />
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
