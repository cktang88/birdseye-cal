// Utility to handle dialogs in both Tauri and web environments

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tauriDialog: any = null;

// Check if we're running in Tauri
const isTauri = () => {
  return "__TAURI__" in window;
};

// Lazy load Tauri dialog API only if in Tauri environment
const getTauriDialog = async () => {
  if (tauriDialog) return tauriDialog;
  if (isTauri()) {
    try {
      // Use Function constructor to avoid TypeScript trying to resolve the import at compile time
      const importFn = new Function('modulePath', 'return import(modulePath)');
      tauriDialog = await importFn("@tauri-apps/plugin-dialog");
      return tauriDialog;
    } catch (error) {
      console.error("Failed to load Tauri dialog API:", error);
      return null;
    }
  }
  return null;
};

/**
 * Shows a confirmation dialog that works in both Tauri and web environments
 */
export async function askConfirm(
  message: string,
  options?: {
    title?: string;
    okLabel?: string;
    cancelLabel?: string;
  }
): Promise<boolean> {
  const dialog = await getTauriDialog();
  
  if (dialog) {
    // Use Tauri dialog
    return await dialog.ask(message, {
      title: options?.title || "Confirm",
      okLabel: options?.okLabel || "OK",
      cancelLabel: options?.cancelLabel || "Cancel",
    });
  } else {
    // Fall back to browser confirm
    return confirm(message);
  }
}

/**
 * Shows a message dialog that works in both Tauri and web environments
 */
export async function showMessage(
  message: string,
  options?: {
    title?: string;
    okLabel?: string;
  }
): Promise<void> {
  const dialog = await getTauriDialog();
  
  if (dialog) {
    // Use Tauri dialog
    await dialog.message(message, {
      title: options?.title || "Message",
      okLabel: options?.okLabel || "OK",
    });
  } else {
    // Fall back to browser alert
    alert(message);
  }
}

