function getApiUrl(): string {
  let baseUrl = 'http://localhost:3001';
  
  if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL;
  } else if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('prexup.com')) {
      baseUrl = 'https://api.prexup.com';
    }
  }
  
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }
  
  return baseUrl;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Error ${response.status}`);
    }

    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor backend (https://api.prexup.com). Verifica que la API esté activa.');
    }
    throw err;
  }
}

// Contacts
export const getContacts = () => fetchApi('/contacts');
export const createContact = (data: any) => fetchApi('/contacts', { method: 'POST', body: JSON.stringify(data) });
export const updateContact = (id: string, data: any) => fetchApi(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContact = (id: string) => fetchApi(`/contacts/${id}`, { method: 'DELETE' });
export const getLeadSources = () => fetchApi('/contacts/sources');
export const createLeadSource = (data: any) => fetchApi('/contacts/sources', { method: 'POST', body: JSON.stringify(data) });
export const updateLeadSource = (id: string, data: any) => fetchApi(`/contacts/sources/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLeadSource = (id: string) => fetchApi(`/contacts/sources/${id}`, { method: 'DELETE' });

// Inventory
export const getProjects = () => fetchApi('/inventory/projects');
export const createProject = (data: any) => fetchApi('/inventory/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id: string, data: any) => fetchApi(`/inventory/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id: string) => fetchApi(`/inventory/projects/${id}`, { method: 'DELETE' });
export const getDevelopers = () => fetchApi('/inventory/developers');
export const createDeveloper = (data: any) => fetchApi('/inventory/developers', { method: 'POST', body: JSON.stringify(data) });
export const updateDeveloper = (id: string, data: any) => fetchApi(`/inventory/developers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDeveloper = (id: string) => fetchApi(`/inventory/developers/${id}`, { method: 'DELETE' });

export const getProperties = () => fetchApi('/inventory/properties');
export const createProperty = (data: any) => fetchApi('/inventory/properties', { method: 'POST', body: JSON.stringify(data) });
export const updateProperty = (id: string, data: any) => fetchApi(`/inventory/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProperty = (id: string) => fetchApi(`/inventory/properties/${id}`, { method: 'DELETE' });

// Pipeline
export const getPipeline = () => fetchApi('/pipeline');
export const getPipelineStages = () => fetchApi('/pipeline/stages');
export const updatePipelineStage = (id: string, data: any) => fetchApi(`/pipeline/stages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const createOpportunity = (data: any) => fetchApi('/pipeline', { method: 'POST', body: JSON.stringify(data) });
export const updateOpportunityStage = (id: string, stage: string) => fetchApi(`/pipeline/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) });
export const deleteOpportunity = (id: string) => fetchApi(`/pipeline/${id}`, { method: 'DELETE' });

// Clients (Gestión de Clientes)
export const getClients = () => fetchApi('/clients');
export const getClient = (id: string) => fetchApi(`/clients/${id}`);
export const createClient = (data: any) => fetchApi('/clients', { method: 'POST', body: JSON.stringify(data) });
export const updateClient = (id: string, data: any) => fetchApi(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteClient = (id: string) => fetchApi(`/clients/${id}`, { method: 'DELETE' });

// Finances - Accounts
export const getAccounts = () => fetchApi('/finances/accounts');
export const createAccount = (data: any) => fetchApi('/finances/accounts', { method: 'POST', body: JSON.stringify(data) });
export const deleteAccount = (id: string) => fetchApi(`/finances/accounts/${id}`, { method: 'DELETE' });

// Finances - Incomes
export const getIncomes = () => fetchApi('/finances/incomes');
export const createIncome = (data: any) => fetchApi('/finances/incomes', { method: 'POST', body: JSON.stringify(data) });
export const deleteIncome = (id: string) => fetchApi(`/finances/incomes/${id}`, { method: 'DELETE' });

// Finances - Expenses
export const getExpenses = () => fetchApi('/finances/expenses');
export const createExpense = (data: any) => fetchApi('/finances/expenses', { method: 'POST', body: JSON.stringify(data) });
export const deleteExpense = (id: string) => fetchApi(`/finances/expenses/${id}`, { method: 'DELETE' });

// Finances - Journal Entries
export const getJournalEntries = () => fetchApi('/finances/journal-entries');
export const createJournalEntry = (data: any) => fetchApi('/finances/journal-entries', { method: 'POST', body: JSON.stringify(data) });

// Appointments
export const getAppointments = () => fetchApi('/appointments');
export const createAppointment = (data: any) => fetchApi('/appointments', { method: 'POST', body: JSON.stringify(data) });
export const updateAppointment = (id: string, data: any) => fetchApi(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAppointment = (id: string) => fetchApi(`/appointments/${id}`, { method: 'DELETE' });

// Contracts
export const getContracts = () => fetchApi('/contracts');
export const createContract = (data: any) => fetchApi('/contracts', { method: 'POST', body: JSON.stringify(data) });
export const updateContract = (id: string, data: any) => fetchApi(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContract = (id: string) => fetchApi(`/contracts/${id}`, { method: 'DELETE' });

// Chats (WhatsApp)
export const getChats = () => fetchApi('/chats');
export const getChatMessages = (chatId: string) => fetchApi(`/chats/${chatId}/messages`);
export const sendChatMessage = (chatId: string, text: string) => fetchApi(`/chats/${chatId}/send`, { method: 'POST', body: JSON.stringify({ text }) });
export const toggleChatBot = (chatId: string, isBotActive: boolean) => fetchApi(`/chats/${chatId}/bot`, { method: 'PATCH', body: JSON.stringify({ isBotActive }) });

// Templates (WhatsApp)
export const getTemplates = () => fetchApi('/templates');
export const createTemplate = (data: any) => fetchApi('/templates', { method: 'POST', body: JSON.stringify(data) });
export const seedTemplates = () => fetchApi('/templates/seed', { method: 'POST' });

// Campaigns
export const getCampaigns = () => fetchApi('/campaigns');
export const getCampaign = (id: string) => fetchApi(`/campaigns/${id}`);
export const createCampaign = (data: { name: string; templateId: string; contactIds: string[]; scheduledAt?: string }) => fetchApi('/campaigns', { method: 'POST', body: JSON.stringify(data) });

// Users
export const getUsers = () => fetchApi('/auth/users');
export const sendCampaign = (id: string) => fetchApi(`/campaigns/${id}/send`, { method: 'POST' });

