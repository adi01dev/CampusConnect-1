import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  getOfflineAttendance, 
  deleteOfflineAttendance, 
  getOfflineSubmissions, 
  deleteOfflineSubmission 
} from "@/lib/offlineStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const PWAController = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Sync offline queued updates
  const runSync = async () => {
    if (isSyncing) return;
    
    try {
      const attendance = await getOfflineAttendance();
      const submissions = await getOfflineSubmissions();
      
      const totalItems = attendance.length + submissions.length;
      if (totalItems === 0) return;

      setIsSyncing(true);
      window.dispatchEvent(new CustomEvent("pwa-sync-status", { detail: { syncing: true, count: totalItems } }));
      
      let successCount = 0;

      // 1. Sync Scanned Attendance Logs
      for (const scan of attendance) {
        try {
          const res = await fetch(`${API_BASE}/student/attendance/mark`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${scan.token}`,
            },
            body: JSON.stringify({
              sessionId: scan.sessionId,
              qrPayload: scan.qrPayload,
              scanDelay: scan.scanDelay,
              timestamp: scan.timestamp
            }),
          });
          
          if (res.ok) {
            await deleteOfflineAttendance(scan.id);
            successCount++;
          }
        } catch (err) {
          console.error("Failed to sync attendance scan:", err);
        }
      }

      // 2. Sync Coursework Submissions
      for (const sub of submissions) {
        try {
          // Convert base64 representation back to a file blob
          let file: File | null = null;
          if (sub.fileData && sub.fileName && sub.fileType) {
            const byteCharacters = atob(sub.fileData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: sub.fileType });
            file = new File([blob], sub.fileName, { type: sub.fileType });
          }

          const formData = new FormData();
          if (sub.submissionText) {
            formData.append("submissionText", sub.submissionText);
          }
          if (file) {
            formData.append("file", file);
          }

          const res = await fetch(`${API_BASE}/assignments/${sub.assignmentId}/submit`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sub.token}`
            },
            body: formData,
          });

          if (res.ok) {
            await deleteOfflineSubmission(sub.id);
            successCount++;
          }
        } catch (err) {
          console.error("Failed to sync coursework submission:", err);
        }
      }

      if (successCount > 0) {
        toast({
          title: "PWA Sync Complete",
          description: `Automatically synchronized ${successCount} pending offline updates successfully.`
        });
        
        // Dispatch refresh event to update active list views
        window.dispatchEvent(new CustomEvent("pwa-data-synced"));
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
      window.dispatchEvent(new CustomEvent("pwa-sync-status", { detail: { syncing: false, count: 0 } }));
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.dispatchEvent(new CustomEvent("pwa-connectivity", { detail: { online: true } }));
      toast({
        title: "Connection Restored",
        description: "Back online. Verifying local databases for pending syncs..."
      });
      runSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      window.dispatchEvent(new CustomEvent("pwa-connectivity", { detail: { online: false } }));
      toast({
        title: "Offline Mode Active",
        description: "Viewing cached pages. Any modifications will be queued securely.",
        variant: "destructive"
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    if (navigator.onLine) {
      runSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  // Capture PWA Install Promotion Event
  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Dispatch custom PWA install status
      window.dispatchEvent(new CustomEvent("pwa-installable", { detail: { installable: true } }));
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Listen to custom install trigger events
    const triggerInstall = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Install choice: ${outcome}`);
      setDeferredPrompt(null);
      window.dispatchEvent(new CustomEvent("pwa-installable", { detail: { installable: false } }));
    };

    const handleTriggerEvent = () => triggerInstall();
    window.addEventListener("pwa-trigger-install", handleTriggerEvent);

    // Listen to Background Sync notifications from Service Worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SYNC_OFFLINE_DATA") {
        console.log("Sync message received from Service Worker");
        runSync();
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("pwa-trigger-install", handleTriggerEvent);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
    };
  }, [deferredPrompt]);

  return null; // Headless state controller
};
