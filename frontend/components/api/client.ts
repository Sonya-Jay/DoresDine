// components/api/client.ts
import { API_URL } from '@env';
import {
  DiningHall,
  DayMenu,
  MenuItem,
} from '../../../backend/src/types/dining';

const baseUrl = API_URL.replace(/\/$/, '');

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
    throw new Error(parsed?.error || parsed?.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  getHalls: (): Promise<DiningHall[]> => request<DiningHall[]>('/dining/halls'),
  getHallMenu: (
    hallId: number,
  ): Promise<{ hall: string; schedule: DayMenu[] }> =>
    request<{ hall: string; schedule: DayMenu[] }>(
      `/dining/halls/${hallId}/menu`,
    ),
  getMenuItems: (menuId: number, unitId: number): Promise<MenuItem[]> =>
    request<MenuItem[]>(`/dining/menu/${menuId}/items?unitId=${unitId}`),
};
