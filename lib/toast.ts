export type ToastType = "success" | "error" | "info";

const TOAST_ROOT_ID = "srs-toast-root";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStylesByType(type: ToastType): string {
  if (type === "success") {
    return "border:#bbf7d0;background:#f0fdf4;color:#166534;";
  }
  if (type === "error") {
    return "border:#fecaca;background:#fef2f2;color:#991b1b;";
  }
  return "border:#bfdbfe;background:#eff6ff;color:#1e3a8a;";
}

function ensureToastRoot(): HTMLDivElement {
  const existing = document.getElementById(TOAST_ROOT_ID);
  if (existing) {
    return existing as HTMLDivElement;
  }

  const root = document.createElement("div");
  root.id = TOAST_ROOT_ID;
  root.style.position = "fixed";
  root.style.top = "16px";
  root.style.right = "16px";
  root.style.zIndex = "9999";
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.gap = "8px";
  document.body.appendChild(root);
  return root;
}

export function showToast(message: string, type: ToastType = "info"): void {
  if (!isBrowser() || !message.trim()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("srs:toast", {
      detail: { type, message },
    }),
  );

  const root = ensureToastRoot();
  const toast = document.createElement("div");
  toast.setAttribute(
    "style",
    `max-width:320px;border:1px solid;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,.08);${getStylesByType(type)}`,
  );
  toast.textContent = message;
  root.appendChild(toast);

  const remove = () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  };

  window.setTimeout(remove, 3000);
}

export function showSuccessToast(message: string): void {
  showToast(message, "success");
}

export function showErrorToast(message: string): void {
  showToast(message, "error");
}
