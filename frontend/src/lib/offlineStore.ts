const DB_NAME = "CampusConnectPWA";
const DB_VERSION = 1;

export interface OfflineAttendance {
  id: string;
  sessionId: string;
  qrPayload: string;
  scanDelay: number;
  timestamp: number;
  token: string;
}

export interface OfflineSubmission {
  id: string;
  assignmentId: string;
  submissionText: string;
  fileName: string | null;
  fileType: string | null;
  fileData: string | null; // Base64 string of file data
  token: string;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains("offline_attendance")) {
        db.createObjectStore("offline_attendance", { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains("offline_submissions")) {
        db.createObjectStore("offline_submissions", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// --- Attendance Methods ---

export async function saveOfflineAttendance(attendance: Omit<OfflineAttendance, "id">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offline_attendance", "readwrite");
    const store = transaction.objectStore("offline_attendance");
    const record = { ...attendance, id: Math.random().toString(36).substring(7) };

    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineAttendance(): Promise<OfflineAttendance[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offline_attendance", "readonly");
    const store = transaction.objectStore("offline_attendance");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineAttendance(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offline_attendance", "readwrite");
    const store = transaction.objectStore("offline_attendance");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Submission Methods ---

export async function saveOfflineSubmission(submission: Omit<OfflineSubmission, "id">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offline_submissions", "readwrite");
    const store = transaction.objectStore("offline_submissions");
    const record = { ...submission, id: Math.random().toString(36).substring(7) };

    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineSubmissions(): Promise<OfflineSubmission[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offline_submissions", "readonly");
    const store = transaction.objectStore("offline_submissions");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineSubmission(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offline_submissions", "readwrite");
    const store = transaction.objectStore("offline_submissions");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
