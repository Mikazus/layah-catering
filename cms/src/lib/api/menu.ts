import { apiRequest } from "@/lib/api/client";
import type { CreateMenuDTO, MenuItem, UpdateMenuDTO } from "@/types/menu";

export async function getMenusApi(): Promise<MenuItem[]> {
  return apiRequest<MenuItem[]>("/menus");
}

export async function createMenuApi(payload: CreateMenuDTO): Promise<MenuItem> {
  return apiRequest<MenuItem>("/menus", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMenuApi(
  id: string,
  payload: UpdateMenuDTO
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menus/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMenuApi(id: string): Promise<void> {
  await apiRequest(`/menus/${encodeURIComponent(id)}`, { method: "DELETE" });
}
