import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { ProfileId, ProfileStore } from './profile-store';
import { mountPau } from '../core/pau';
import { mountMarina } from '../core/marina';
import { mountJuntos, unseenCheers, markCheersSeen } from '../core/juntos';
import { DEFAULT_PROFILE_BY_EMAIL } from '../environments/profiles.config';

type ViewId = ProfileId | 'juntos';

const VIEWS: Record<ViewId, { name: string; emoji: string; theme: string }> = {
  pau: { name: 'Pau', emoji: '🏋️', theme: 'theme-pau' },
  marina: { name: 'Marina', emoji: '🏃‍♀️', theme: 'theme-marina' },
  juntos: { name: 'Juntos', emoji: '🏆', theme: 'theme-juntos' },
};
const NAMES: Record<ProfileId, string> = { pau: 'Pau', marina: 'Marina' };

interface Cheer { from: ProfileId; text: string; ts: number; }

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    @if (loadingAuth()) {
      <div class="center"><div class="spinner"></div></div>
    } @else if (!user()) {
      <div class="login">
        <div class="logo">🏋️ <span>♡</span> 🏃‍♀️</div>
        <h1>Entreno de Pau y Marina</h1>
        <p>Tu plan, tus registros y tu progreso, sincronizados en todos tus dispositivos.</p>
        <button class="gbtn" (click)="login()">Entrar con Google</button>
        @if (error()) { <p class="err">{{ error() }}</p> }
      </div>
    } @else {
      <header class="bar" [class.pink]="view() === 'marina'" [class.lila]="view() === 'juntos'">
        <div class="switch" role="tablist" aria-label="Vista">
          @for (v of viewIds; track v) {
            <button role="tab" [class.on]="view() === v" [attr.aria-selected]="view() === v" (click)="setView(v)">
              {{ views[v].emoji }} {{ views[v].name }}
            </button>
          }
        </div>
        <button class="out" (click)="logout()" title="Cerrar sesión">Salir</button>
      </header>
      @if (cheer(); as c) {
        <div class="cheer" role="status">
          <span class="ce">💌</span>
          <span class="ct"><b>{{ names[c.from] }} te manda:</b> {{ c.text }}@if (cheerCount() > 1) { <small> (+{{ cheerCount() - 1 }} más)</small> }</span>
          <button (click)="dismissCheer()" aria-label="Cerrar">✕</button>
        </div>
      }
      <p class="sync" [class.err]="statusError()">{{ status() }}</p>
      @if (loadingData()) { <div class="center small"><div class="spinner"></div></div> }
      <div #host class="host" [class.hidden]="loadingData()"></div>
    }
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .center { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .center.small { min-height: 40vh; }
    .spinner { width: 34px; height: 34px; border-radius: 50%; border: 4px solid rgba(0,0,0,.08); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .login { max-width: 420px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 24px; text-align: center; }
    .logo { font-size: 44px; margin-bottom: 8px; }
    .logo span { color: #d9718f; }
    .login h1 { font-size: 26px; margin: 0 0 8px; }
    .login p { color: #6b7080; line-height: 1.5; margin: 0 0 22px; }
    .gbtn { font: inherit; font-weight: 600; font-size: 15px; border: 0; border-radius: 999px; padding: 13px 20px; background: #1f2433; color: #fff; cursor: pointer; }
    .err { color: #c0392b !important; font-size: 13px; margin-top: 14px !important; }
    .bar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(246,243,238,.92); backdrop-filter: blur(8px); max-width: 760px; margin: 0 auto; height: 56px; box-sizing: border-box; }
    .bar.pink { background: rgba(253,243,246,.92); }
    .bar.lila { background: rgba(248,244,242,.92); }
    .switch { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); background: rgba(0,0,0,.06); border-radius: 999px; padding: 3px; }
    .switch button { font: inherit; font-size: 13px; font-weight: 600; border: 0; background: none; border-radius: 999px; padding: 8px 0; cursor: pointer; color: #555; white-space: nowrap; }
    .switch button.on { background: #fff; color: var(--accent); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
    .out { font: inherit; font-size: 12px; border: 1px solid rgba(0,0,0,.1); background: #fff; border-radius: 999px; padding: 7px 10px; cursor: pointer; color: #555; }
    .cheer { max-width: 732px; margin: 6px auto 0; display: flex; align-items: center; gap: 10px; background: linear-gradient(120deg, #fff5dc, #fde4ec); border: 1px solid #f6dfb0; border-radius: 16px; padding: 10px 12px; font-size: 13.5px; box-sizing: border-box; animation: drop .4s ease; }
    @media (max-width: 760px) { .cheer { margin: 6px 14px 0; } }
    @keyframes drop { from { transform: translateY(-8px); opacity: 0; } to { transform: none; opacity: 1; } }
    .cheer .ce { font-size: 20px; }
    .cheer .ct { flex: 1; line-height: 1.4; }
    .cheer small { color: #8a6f7c; }
    .cheer button { border: 0; background: rgba(255,255,255,.7); border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 13px; }
    .sync { text-align: center; font-size: 11.5px; color: #8a8f9c; margin: 2px 0 0; min-height: 15px; }
    .sync.err { color: #c0392b; }
    .host { --top-offset: 56px; }
    .hidden { display: none; }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);

  readonly views = VIEWS;
  readonly viewIds = Object.keys(VIEWS) as ViewId[];
  readonly names = NAMES;

  user = signal<User | null>(null);
  loadingAuth = signal(true);
  loadingData = signal(false);
  view = signal<ViewId>('pau');
  status = signal('');
  statusError = signal(false);
  error = signal('');
  cheer = signal<Cheer | null>(null);
  cheerCount = signal(0);

  private me: ProfileId | null = null;
  private hostEl?: HTMLElement;
  private stores: ProfileStore[] = [];
  private unmount?: () => void;
  private unsubCheers?: () => void;
  private mountSeq = 0;
  private unsubAuth?: () => void;

  @ViewChild('host') set hostRef(ref: ElementRef<HTMLElement> | undefined) {
    const el = ref?.nativeElement;
    if (el === this.hostEl) return;
    this.hostEl = el;
    if (el) this.mount();
  }

  ngOnInit() {
    this.applyTheme();
    this.unsubAuth = onAuthStateChanged(auth, (u) => {
      this.zone.run(() => {
        // Al entrar, cada uno empieza en su propio perfil (luego puede ver el del otro o la vista Juntos).
        this.me = u?.email ? DEFAULT_PROFILE_BY_EMAIL[u.email.toLowerCase()] ?? null : null;
        if (this.me && this.me !== this.view()) { this.view.set(this.me); this.applyTheme(); }
        this.user.set(u);
        this.loadingAuth.set(false);
        if (!u) this.teardown();
      });
    });
  }

  ngOnDestroy() {
    this.teardown();
    this.unsubAuth?.();
  }

  async login() {
    this.error.set('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, provider);
      } else if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        this.error.set('No se pudo iniciar sesión: ' + (e?.message || e));
      }
    }
  }

  async logout() {
    this.teardown();
    await signOut(auth);
  }

  setView(v: ViewId) {
    if (v === this.view()) return;
    this.view.set(v);
    this.applyTheme();
    window.scrollTo({ top: 0 });
    this.mount();
  }

  dismissCheer() {
    if (this.me) markCheersSeen(this.me);
    this.cheer.set(null);
    this.cheerCount.set(0);
  }

  private applyTheme() {
    document.body.classList.remove('theme-pau', 'theme-marina', 'theme-juntos');
    document.body.classList.add(VIEWS[this.view()].theme);
  }

  private setStatus = (text: string, isError = false) =>
    this.zone.run(() => { this.status.set(text); this.statusError.set(isError); });

  /** Monta la vista activa (fuera de la zona de Angular: las animaciones no disparan detección de cambios). */
  private async mount() {
    if (!this.hostEl) return;
    const seq = ++this.mountSeq;
    this.teardown(false);
    const view = this.view();
    const ids: ProfileId[] = view === 'juntos' ? ['pau', 'marina'] : [view];
    const stores = ids.map((id) => new ProfileStore(id, this.setStatus));
    this.stores = stores;
    this.loadingData.set(true);
    this.setStatus('Cargando…');
    await Promise.all(stores.map((s) => s.start()));
    if (seq !== this.mountSeq || !this.hostEl) { stores.forEach((s) => s.stop()); return; }
    const byId = Object.fromEntries(ids.map((id, i) => [id, stores[i]])) as Record<ProfileId, ProfileStore>;
    this.zone.runOutsideAngular(() => {
      if (view === 'pau') this.unmount = mountPau(this.hostEl!, byId.pau);
      else if (view === 'marina') this.unmount = mountMarina(this.hostEl!, byId.marina);
      else this.unmount = mountJuntos(this.hostEl!, byId, this.me);
    });
    this.loadingData.set(false);
    this.watchCheers(byId);
  }

  /** Aviso cuando el otro te manda ánimos (si tu perfil está cargado en la vista actual). */
  private watchCheers(byId: Partial<Record<ProfileId, ProfileStore>>) {
    const me = this.me;
    const store = me ? byId[me] : undefined;
    if (!me || !store) return;
    const check = () => this.zone.run(() => {
      const list = unseenCheers(store, me) as Cheer[];
      this.cheerCount.set(list.length);
      this.cheer.set(list.length ? list[list.length - 1] : null);
    });
    check();
    this.unsubCheers = store.subscribe(check);
  }

  private teardown(clearHost = true) {
    try { this.unmount?.(); } catch { /* ignorar */ }
    this.unmount = undefined;
    this.unsubCheers?.();
    this.unsubCheers = undefined;
    this.stores.forEach((s) => s.stop());
    this.stores = [];
    if (clearHost) this.hostEl = undefined;
  }
}
