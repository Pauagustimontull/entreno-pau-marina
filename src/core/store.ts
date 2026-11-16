/**
 * Almacén de datos que usan los planes (Pau y Marina).
 * Cada perfil guarda unos pocos documentos JSON: 'meta', 'sessions', 'body', 'runs', 'ex-L-0'...
 * La app de Angular lo implementa con Firestore (ver app/profile-store.ts).
 */
export interface CoreStore {
  /** Devuelve el documento guardado (o undefined). Lectura síncrona desde la caché. */
  get(key: string): any;
  /** Copia de todos los documentos (para la copia de seguridad). */
  all(): Record<string, any>;
  /** Guarda el documento entero (sustituye). */
  set(key: string, value: any): void;
  /** Avisa cuando cambian los datos (por ejemplo, desde otro móvil). Devuelve la función para dejar de escuchar. */
  subscribe(listener: () => void): () => void;
}

/** Almacén en memoria + localStorage, útil para probar sin Firebase. */
export class LocalStore implements CoreStore {
  private data: Record<string, any> = {};
  private listeners = new Set<() => void>();
  constructor(private prefix: string) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) this.data[k.slice(prefix.length)] = JSON.parse(localStorage.getItem(k) || 'null');
      }
    } catch { /* sin localStorage */ }
  }
  get(key: string) { return this.data[key]; }
  all() { return { ...this.data }; }
  set(key: string, value: any) {
    this.data[key] = value;
    try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); } catch { /* ignorar */ }
  }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
}
