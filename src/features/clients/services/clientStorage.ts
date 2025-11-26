import type { ClientRegistrationFormData } from "../components/ClientRegistrationForm";

export type { ClientRegistrationFormData };

export interface Client extends ClientRegistrationFormData {
    id: string;
    createdAt: string;
    bonus?: string;
    creditStatus?: string;
}

const STORAGE_KEY = "ecometrix_clients";

export const clientStorage = {
    getAll(): Client[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored);
        } catch {
            return [];
        }
    },

    save(client: ClientRegistrationFormData): Client {
        const clients = this.getAll();
        const newClient: Client = {
            ...client,
            id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            bonus: this.determineBonus(client),
            creditStatus: "En Proceso",
        };
        clients.push(newClient);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
        return newClient;
    },

    delete(id: string): void {
        const clients = this.getAll();
        const filtered = clients.filter((c) => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    update(id: string, updates: Partial<Client>): void {
        const clients = this.getAll();
        const index = clients.findIndex((c) => c.id === id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
        }
    },

    determineBonus(client: ClientRegistrationFormData): string {
        const income = Number(client.financiera.familyIncome) || 0;
        const savings = Number(client.financiera.savings) || 0;
        const debts = Number(client.financiera.debts) || 0;
        const firstHome = client.financiera.firstHome;

        if (income >= 5000 && savings >= 30000 && debts < 10000 && firstHome) {
            return "MiVivienda";
        }
        if (income >= 4000 && savings >= 20000 && firstHome) {
            return "Techo Propio";
        }
        return "Ninguno";
    },
};

