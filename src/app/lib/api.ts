import { z } from "zod";

export const fetchAndValidate = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
  const urlWithCacheBuster = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
  const res = await fetch(urlWithCacheBuster);
  if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
  const data = await res.json();
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues;
      console.error(`Validation error for ${url}:`, issues);
      throw new Error(`Dados inválidos em ${url}: ${error.message}`);
    }
    throw error;
  }
};
