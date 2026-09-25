// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

type UserRole = "SuperAdmin" | "ProjectManager" | "Facilitator" | "Reviewer";

interface ExtendedUser {
  id: string;
  role: UserRole;
  profile_picture: string | null;
  email: string;
  name?: string | null;
  username: string;
  access_token: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  expires_at?: number;
}


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/auth/login`,
            {
              username: credentials?.email,
              password: credentials?.password,
            }
          );

          const responseData = response.data.data;
          if (!responseData || !responseData.user) {
            console.error("Invalid response format:", response.data);
            return null;
          }

          return {
            id: responseData.user.id,
            email: responseData.user.email,
            username: responseData.user.email,
            first_name: responseData.user.first_name,
            last_name: responseData.user.last_name,
            middle_name: responseData.user.middle_name,
            profile_picture: responseData.user.profile_picture,
            role: responseData.user.role.name as UserRole,
            access_token: responseData.access_token,
          };
        } catch (error: any) {
          
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.access_token = (user as ExtendedUser).access_token;
        token.profile_picture = (user as ExtendedUser).profile_picture;
        token.email = (user as ExtendedUser).email;
        token.username = (user as ExtendedUser).username;
        token.first_name = (user as ExtendedUser).first_name;
        token.last_name = (user as ExtendedUser).last_name;
        token.middle_name = (user as ExtendedUser).middle_name;
        token.expires_at = Date.now() + 24 * 60 * 60 * 1000;
      } else {
        if (
          typeof token.expires_at === "number" &&
          Date.now() > token.expires_at
        ) {

          throw new Error("SessionExpired");
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.access_token = token.access_token as string;
        session.user.profile_picture =
          typeof token.profile_picture === "string"
            ? token.profile_picture
            : null;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.middle_name = token.middle_name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
