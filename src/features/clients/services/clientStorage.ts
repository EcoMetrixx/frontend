// src/features/clients/services/clientStorage.ts
import type { ClientDto } from "./clientsApi";

export type Client = ClientDto;

const ACTIVE_CLIENT_KEY = "activeClient";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const clientStorage = {
  setActiveClient(client: Client | null) {
    if (!hasStorage()) return;
    if (client) {
      window.localStorage.setItem(ACTIVE_CLIENT_KEY, JSON.stringify(client));
    } else {
      window.localStorage.removeItem(ACTIVE_CLIENT_KEY);
    }
  },

  getActiveClient(): Client | null {
    if (!hasStorage()) return null;
    const raw = window.localStorage.getItem(ACTIVE_CLIENT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Client;
    } catch {
      return null;
    }
  },

  clearActiveClient() {
    if (!hasStorage()) return;
    window.localStorage.removeItem(ACTIVE_CLIENT_KEY);
  },
};
