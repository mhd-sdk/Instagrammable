import { LocalStorage } from "./local";
import type { IStorage } from "./storage.interface";

let storage: IStorage | null = null;

// Storage provider factory/singleton - Local storage
export function getStorage(): { storage: IStorage; type: "local" } {
  if (!storage) {
    storage = new LocalStorage();
  }

  return { storage, type: "local" };
}
