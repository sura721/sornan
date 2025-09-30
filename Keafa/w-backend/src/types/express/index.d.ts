// /src/types/express/index.d.ts

// This tells TypeScript to add our custom properties to the Express Request type.
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      username: string;
    };
  }
}