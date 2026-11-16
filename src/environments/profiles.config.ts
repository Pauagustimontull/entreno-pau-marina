import type { ProfileId } from '../app/profile-store';

// Perfil que se abre por defecto según la cuenta de Google con la que se entra.
// (Los mismos correos que en firestore.rules.)
export const DEFAULT_PROFILE_BY_EMAIL: Record<string, ProfileId> = {
  'pauagustimontull@gmail.com': 'pau',
  'cabreracabreramarina@gmail.com': 'marina',
};
