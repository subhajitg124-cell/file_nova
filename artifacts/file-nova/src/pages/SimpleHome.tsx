import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FileUp, Package, Image, FileArchive, ChevronRight } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";

export default function SimpleHome() {
  const [, setLocation] = useLocation();
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    const checkApiHealth = async () => {
      if (!BACKEND_URL) {
        setApiStatus("online");
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/healthz`, { method: "GET" });
        setApiStatus(res.ok ? "online" : "offline");
      } catch {
        setApiStatus("offline");
      }
    };
    checkApiHealth();
  }, []);

  const handleScholarshipClick = () => {
    // Pre-configure for scholarship ZIP
    useFileStore.setState({
      selectedSection: "pdf",
      selectedOperation: "convert",
      operationOptions: { operation: "html_to_zip" }
    });
    setLocation("/dashboard?tool=scholarship");
  };

  const handleResizeClick = () => {
    useFileStore.setState({
      selectedSection: "image",
      selectedOperation: "resize",
      operationOptions: { 
        resizeType: "dimensions", 
        width: 200, 
        height: 230,
        resize_width: 200,
        resize_height: 230
      }
    });
    setLocation("/dashboard?tool=resize");
  };

  const handleCompressClick = () => {
    useFileStore.setState({
      selectedSection: "pdf",
      selectedOperation: "compress"
    });
    setLocation("/dashboard?tool=compress");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <ConnectionStatusIndicator status={apiStatus} />
      <OfflineBanner />

      {/* Hero Section - Simple 3 actions */}
      <section className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Fix My Documents
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
            Free tools for Indian scholarships & government forms
          </p>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <button
              onClick={handleScholarshipClick}
              className="group flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 transition-all"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 transition">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  Scholarship ZIP
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-create portal-ready ZIP
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleResizeClick}
              className="group flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-emerald-300 transition-all"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900 group-hover:bg-emerald-200 transition">
                <Image className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  Resize Photo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aadhaar, passport, signature
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleCompressClick}
              className="group flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-amber-300 transition-all"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900 group-hover:bg-amber-200 transition">
                <FileArchive className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  Compress PDF
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Under 200KB for portals
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-16 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> 100% Free for students
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Files auto-deleted in 1 hour
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Works on mobile & CSC
            </span>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-16 px-4 md:px-6 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
            3 Simple Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl">
                1
              </div>
              <h3 className="font-bold mb-2">Choose</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pick your form type or tool
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl">
                2
              </div>
              <h3 className="font-bold mb-2">Upload</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop your files (we auto-fix)
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl">
                3
              </div>
              <h3 className="font-bold mb-2">Download</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get portal-ready files
              </p>
            </div>
          </div>
        </div>
      </section>

      <Toaster closeButton position="top-right" richColors />
    </div>
  );
}