import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the user property
    }
  }
}
