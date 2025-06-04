import 'dotenv/config';

// Dummy middleware for development
export const isAuthenticated = (req: any, res: any, next: any) => {
  console.log("⚠️ Skipping real auth: allowing all requests (DEV MODE)");
  next(); // always allow
};

export async function setupAuth(app: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log("🛑 Replit Auth skipped in development mode.");
    return;
  }

  // 👇 In production, load full auth logic here
}
