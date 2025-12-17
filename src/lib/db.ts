import { kv } from '@vercel/kv';
import { UserProfile, GroupSession, EveningPlan, SMSConversationState } from './types';

const isKVConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

const memoryStore = new Map<string, unknown>();

async function get<T>(key: string): Promise<T | null> {
  if (isKVConfigured) {
    return kv.get<T>(key);
  }
  return (memoryStore.get(key) as T) || null;
}

async function set<T>(key: string, value: T, exSeconds?: number): Promise<void> {
  if (isKVConfigured) {
    if (exSeconds !== undefined) {
      await kv.set(key, value, { ex: exSeconds });
    } else {
      await kv.set(key, value);
    }
  } else {
    memoryStore.set(key, value);
  }
}

async function del(key: string): Promise<void> {
  if (isKVConfigured) {
    await kv.del(key);
  } else {
    memoryStore.delete(key);
  }
}

export const db = {
  user: {
    get: (id: string) => get<UserProfile>(`user:${id}`),
    set: (id: string, profile: UserProfile) => set(`user:${id}`, profile),
    getByPhone: (phone: string) => get<UserProfile>(`user:phone:${phone}`),
    setByPhone: (phone: string, profile: UserProfile) => set(`user:phone:${phone}`, profile),
  },

  group: {
    get: (id: string) => get<GroupSession>(`group:${id}`),
    set: (id: string, session: GroupSession, ttl = 86400) => set(`group:${id}`, session, ttl),
    delete: (id: string) => del(`group:${id}`),
  },

  plan: {
    get: (id: string) => get<EveningPlan>(`plan:${id}`),
    set: (id: string, plan: EveningPlan, ttl = 86400 * 7) => set(`plan:${id}`, plan, ttl),
  },

  sms: {
    getState: (phone: string) => get<SMSConversationState>(`sms:state:${phone}`),
    setState: (phone: string, state: SMSConversationState) => set(`sms:state:${phone}`, state, 3600),
    clearState: (phone: string) => del(`sms:state:${phone}`),
  },
};
