import { createAuth } from '../../src/lib/auth';

// Export a static instance for Better Auth schema generation
export const auth = createAuth({} as any)