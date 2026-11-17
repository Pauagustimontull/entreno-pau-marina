import { collection, doc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { CoreStore } from '../core/store';

/** JSON con las claves ordenadas, para comparar datos sin depender del orden. */
function stable(v: any): string {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

export type ProfileId = 'pau' | 'marina';

/**
 * Datos de un perfil en Firestore: profiles/{perfil}/docs/{documento}.
 * Mantiene una copia en memoria para que los planes lean de forma síncrona.
 */
export class ProfileStore implements CoreStore {
  private cache: Record<string, any> = {};
  private listeners = new Set<() => void>();
  private unsub: Unsubscribe | null = null;

  get profileId() { return this.profile; }

  constructor(
    private profile: ProfileId,
    private onStatus: (text: string, isError?: boolean) => void,
  ) {}

  /** Empieza a escuchar Firestore. Resuelve con la primera carga (o con error). */
  start(): Promise<void> {
    return new Promise((resolve) => {
      let first = true;
      this.unsub = onSnapshot(
        collection(db, 'profiles', this.profile, 'docs'),
        { includeMetadataChanges: true },
        (snap) => {
          const next: Record<string, any> = {};
          snap.forEach((d) => { next[d.id] = d.data(); });
          const changed = stable(next) !== stable(this.cache);
          this.cache = next;
          if (snap.metadata.fromCache) this.onStatus('Sin conexión · se sincroniza al volver la cobertura');
          else if (snap.metadata.hasPendingWrites) this.onStatus('Guardando…');
          else this.onStatus('Sincronizado ✓');
          if (first) { first = false; resolve(); }
          else if (changed) this.listeners.forEach((f) => f());
        },
        (err) => {
          const denied = err.code === 'permission-denied';
          this.onStatus(denied ? 'Esta cuenta no tiene acceso. Revisa los correos en las reglas de Firestore.' : 'Error de conexión: ' + err.message, true);
          if (first) { first = false; resolve(); }
        },
      );
    });
  }

  stop() { this.unsub?.(); this.unsub = null; this.listeners.clear(); }

  get(key: string) { return this.cache[key]; }
  all() { return { ...this.cache }; }

  set(key: string, value: any) {
    // Copia limpia (sin referencias compartidas) para la caché y para Firestore.
    const clean = JSON.parse(JSON.stringify(value));
    this.cache[key] = clean;
    setDoc(doc(db, 'profiles', this.profile, 'docs', key), clean).catch((e) =>
      this.onStatus('No se pudo guardar: ' + (e?.message || e), true),
    );
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}
