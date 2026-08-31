import axios from 'axios';
import { User, Investigation, Entity, Relationship, Alert, AuditLog, GraphData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: async (username: string, password: string) => {
        const res = await api.post('/auth/login/', { username, password });
        if (res.data.access) {
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        return res.data;
    },
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },
    getCurrentUser: async (): Promise<User> => {
        const res = await api.get('/accounts/me/');
        return res.data;
    }
};

export const investigationsApi = {
    list: async (): Promise<Investigation[]> => {
        const res = await api.get('/investigations/');
        return res.data.results || res.data;
    },
    get: async (id: number): Promise<Investigation> => {
        const res = await api.get(`/investigations/${id}/`);
        return res.data;
    },
    create: async (data: Partial<Investigation>): Promise<Investigation> => {
        const res = await api.post('/investigations/', data);
        return res.data;
    }
};

export const entitiesApi = {
    list: async (investigationId?: number): Promise<Entity[]> => {
        const params = investigationId ? { investigation: investigationId } : {};
        const res = await api.get('/entities/', { params });
        return res.data.results || res.data;
    },
    get: async (id: number): Promise<Entity> => {
        const res = await api.get(`/entities/${id}/`);
        return res.data;
    },
    getNetwork: async (id: number, depth: number = 1): Promise<GraphData> => {
        const res = await api.get(`/entities/${id}/network/`, { params: { depth } });
        return res.data;
    },
    getTimeline: async (id: number): Promise<any> => {
        const res = await api.get(`/entities/${id}/timeline/`);
        return res.data;
    },
    globalSearch: async (q: string): Promise<{ entities: Entity[]; investigations: Investigation[] }> => {
        const res = await api.get('/entities/search/', { params: { q } });
        return res.data;
    },
    listMergeCandidates: async (investigationId?: number): Promise<any[]> => {
        const params = investigationId ? { investigation: investigationId } : {};
        const res = await api.get('/entities/merge-candidates/', { params });
        return res.data.results || res.data;
    },
    approveMerge: async (candidateId: number) => {
        const res = await api.post(`/entities/merge-candidates/${candidateId}/approve/`);
        return res.data;
    },
    rejectMerge: async (candidateId: number) => {
        const res = await api.post(`/entities/merge-candidates/${candidateId}/reject/`);
        return res.data;
    }
};

export const relationshipsApi = {
    list: async (investigationId?: number): Promise<Relationship[]> => {
        const params = investigationId ? { investigation: investigationId } : {};
        const res = await api.get('/relationships/', { params });
        return res.data.results || res.data;
    }
};

export const alertsApi = {
    list: async (investigationId?: number): Promise<Alert[]> => {
        const params = investigationId ? { investigation: investigationId } : {};
        const res = await api.get('/alerts/', { params });
        return res.data.results || res.data;
    },
    updateStatus: async (id: number, status: Alert['status']): Promise<Alert> => {
        const res = await api.patch(`/alerts/${id}/`, { status });
        return res.data;
    }
};

export const analysisApi = {
    run: async (investigationId: number) => {
        const res = await api.post('/analysis/run/', { investigation_id: investigationId });
        return res.data;
    },
    getCentrality: async (investigationId: number) => {
        const res = await api.get(`/analysis/${investigationId}/centrality/`);
        return res.data;
    },
    getCommunities: async (investigationId: number) => {
        const res = await api.get(`/analysis/${investigationId}/communities/`);
        return res.data;
    },
    getAnomalies: async (investigationId: number) => {
        const res = await api.get(`/analysis/${investigationId}/anomalies/`);
        return res.data;
    }
};

export const dataImportApi = {
    importData: async (data: FormData) => {
        const res = await api.post('/data/import/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
};

export const auditLogsApi = {
    list: async (): Promise<AuditLog[]> => {
        const res = await api.get('/audit-logs/');
        return res.data.results || res.data;
    }
};
