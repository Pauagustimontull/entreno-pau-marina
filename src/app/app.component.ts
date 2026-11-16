import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { ProfileId, ProfileStore } from './profile-store';
import { mountPau } from '../core/pau';
import { mountMarina } from '../core/marina';

const PROFILES: Record<ProfileId, { name: string; emoji: string; theme: string }> = {
  pau: { name: 'Pau', emoji: '🏋️', theme: 'theme-pau' },
  marina: { name: 'Marina', emoji: '🏃‍♀️', theme: 'theme-marina' },
};

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
      <header class="bar" [class.pink]="profile() === 'marina'">
        <div class="switch" role="tablist" aria-label="Perfil">
          @for (p of profileIds; track p) {
            <button role="tab" [class.on]="profile() === p" [attr.aria-selected]="profile() === p" (click)="setProfile(p)">
              {{ profiles[p].emoji }} {{ profiles[p].name }}
            </button>
          }
        </div>
        <button class="out" (click)="logout()" title="Cerrar sesión">Salir</button>
      </header>
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
    .bar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: rgba(246,243,238,.92); backdrop-filter: blur(8px); max-width: 760px; margin: 0 auto; height: 56px; box-sizing: border-box; }
    .bar.pink { background: rgba(253,243,246,.92); }
    .switch { flex: 1; display: grid; grid-template-columns: 1fr 1fr; background: rgba(0,0,0,.06); border-radius: 999px; padding: 3px; }
    .switch button { font: inherit; font-size: 14px; font-weight: 600; border: 0; background: none; border-radius: 999px; padding: 8px 0; cursor: pointer; color: #555; }
    .switch button.on { background: #fff; color: var(--accent); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
    .out { font: inherit; font-size: 12.5px; border: 1px solid rgba(0,0,0,.1); background: #fff; border-radius: 999px; padding: 7px 12px; cursor: pointer; color: #555; }
    .sync { text-align: center; font-size: 11.5px; color: #8a8f9c; margin: 2px 0 0; min-height: 15px; }
    .sync.err { color: #c0392b; }
    .host { --top-offset: 56px; }
    .hidden { display: none; }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);

  readonly profiles = PROFILES;
  readonly profileIds = Object.keys(PROFILES) as ProfileId[];

  user = signal<User | null>(null);
  loadingAuth = signal(true);
  loadingData = signal(false);
  profile = signal<ProfileId>(this.savedProfile());
  status = signal('');
  statusError = signal(false);
  error = signal('');

  private hostEl?: HTMLElement;
  private store?: ProfileStore;
  private unmount?: () => void;
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

  setProfile(p: ProfileId) {
    if (p === this.profile()) return;
    this.profile.set(p);
    try { localStorage.setItem('entreno-perfil', p); } catch { /* ignorar */ }
    this.applyTheme();
    window.scrollTo({ top: 0 });
    this.mount();
  }

  private savedProfile(): ProfileId {
    try {
      const v = localStorage.getItem('entreno-perfil');
      if (v === 'pau' || v === 'marina') return v;
    } catch { /* ignorar */ }
    return 'pau';
  }

  private applyTheme() {
    document.body.classList.remove('theme-pau', 'theme-marina');
    document.body.classList.add(PROFILES[this.profile()].theme);
  }

  private setStatus = (text: string, isError = false) =>
    this.zone.run(() => { this.status.set(text); this.statusError.set(isError); });

  /** Monta el plan del perfil activo dentro del contenedor (fuera de la zona de Angular: las animaciones no disparan detección de cambios). */
  private async mount() {
    if (!this.hostEl) return;
    const seq = ++this.mountSeq;
    this.teardown(false);
    const profile = this.profile();
    const store = new ProfileStore(profile, this.setStatus);
    this.store = store;
    this.loadingData.set(true);
    this.setStatus('Cargando…');
    await store.start();
    if (seq !== this.mountSeq || !this.hostEl) { store.stop(); return; }
    this.zone.runOutsideAngular(() => {
      this.unmount = profile === 'pau' ? mountPau(this.hostEl!, store) : mountMarina(this.hostEl!, store);
    });
    this.loadingData.set(false);
  }

  private teardown(clearHost = true) {
    try { this.unmount?.(); } catch { /* ignorar */ }
    this.unmount = undefined;
    this.store?.stop();
    this.store = undefined;
    if (clearHost) this.hostEl = undefined;
  }
}
