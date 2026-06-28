import type { CloudProvider } from "./types";
import { Upload } from "lucide-react";

export class DeviceProvider implements CloudProvider {
  id = "device";
  name = "Device";
  icon = Upload({ className: "h-5 w-5" });
  private _inputEl: HTMLInputElement | null = null;

  async authenticate() {}

  async disconnect() {}

  isAvailable() { return true; }

  async isConnected() { return true; }

  supportsImageOnly() { return true; }

  async pickFiles(options?: { multiple?: boolean; imageOnly?: boolean }): Promise<File[]> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = options?.multiple ?? true;
      if (options?.imageOnly) {
        input.accept = "image/jpeg,image/png,image/webp,image/gif";
      }
      input.style.display = "none";
      document.body.appendChild(input);
      input.addEventListener("change", () => {
        const files = Array.from(input.files || []);
        document.body.removeChild(input);
        resolve(files);
      });
      input.click();
    });
  }
}

export const deviceProvider = new DeviceProvider();
