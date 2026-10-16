/* ---------------------------------------------------------------------- */
/* Linked cost sheet file                                                  */
/* Remembers a file the user picked (via the File System Access API) so    */
/* the app can re-read it on every visit. Pointed at the OneDrive-synced   */
/* copy of the SharePoint workbook, that keeps costs current with no       */
/* re-uploading. File handles can't go in localStorage, so they live in a  */
/* tiny IndexedDB store. Supported in Chromium browsers (Edge, Chrome).    */
/* ---------------------------------------------------------------------- */

const DB_NAME = "margin-iq";
const STORE = "handles";
const KEY = "costSheet";

export const fileLinkSupported =
  typeof window !== "undefined" && "showOpenFilePicker" in window;

function withStore(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve(req?.result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}

export async function getLinkedHandle() {
  if (!fileLinkSupported) return null;
  try {
    return (await withStore("readonly", (s) => s.get(KEY))) || null;
  } catch {
    return null;
  }
}

export function saveLinkedHandle(handle) {
  return withStore("readwrite", (s) => s.put(handle, KEY));
}

export function clearLinkedHandle() {
  return withStore("readwrite", (s) => s.delete(KEY));
}

/** Opens the file picker; resolves to the chosen handle, or null if cancelled. */
export async function pickSheetFile() {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Excel workbook",
          accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
          },
        },
      ],
    });
    return handle;
  } catch (err) {
    if (err?.name === "AbortError") return null;
    throw err;
  }
}

/**
 * Reads the linked file. Browsers forget read permission between visits, and
 * asking again needs a click - so with `prompt: false` this returns
 * { needsPermission: true } instead of asking.
 */
export async function readLinkedFile(handle, { prompt = false } = {}) {
  const opts = { mode: "read" };
  // When prompting, ask straight away: the browser only shows the prompt
  // while the click that triggered it is still "fresh", so no awaits first.
  // requestPermission resolves immediately if access is already granted.
  const perm = prompt
    ? await handle.requestPermission(opts)
    : ((await handle.queryPermission?.(opts)) ?? "granted");
  if (perm !== "granted") return { needsPermission: true, denied: prompt };
  return { file: await handle.getFile() };
}
