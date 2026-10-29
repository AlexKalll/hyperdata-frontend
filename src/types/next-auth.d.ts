// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {

  interface User {
    id: string;
    role: "SuperAdmin" | "Admin" | "ProjectManager" | "Facilitator" | "Reviewer";
  }


  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "SuperAdmin" | "Admin" | "ProjectManager" | "Facilitator" | "Reviewer";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {

  interface JWT {
    id: string;
    role: "SuperAdmin" | "Admin" | "ProjectManager" | "Facilitator" | "Reviewer";
  }
}