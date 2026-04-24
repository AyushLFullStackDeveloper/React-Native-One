import { User, Institute, Role } from '../services/api';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  InstituteSelection: { user: User; institutes: Institute[] };
  RoleSelection: { user: User; institute: Institute; roles: Role[]; institutes: Institute[] };
  Dashboard: { user: User; institute: Institute; role: Role };
  AdminDashboard: { user: User; institute: Institute; role: Role };
  Otp: { phoneNumber: string };
};
