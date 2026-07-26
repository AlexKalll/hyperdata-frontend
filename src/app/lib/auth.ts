import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { JWTEncodeParams, JWTDecodeParams } from "next-auth/jwt";
import type { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

// Match the role names exactly as they come from your API
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

interface ExtendedJWT extends JWT {
  id: string;
  role: UserRole;
  access_token: string;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
    access_token: string;
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        req: any
      ) {
        try {


          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/auth/login`,

            {
              username: credentials?.email,
              password: credentials?.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
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
            role: responseData.user.role.name as UserRole, // Using role.name from your API
            access_token: responseData.access_token,
          };
        } catch (error: any) {
          console.error('Authentication error:', error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - matches your token expiry
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
        // Subsequent calls: Check if token is expired
        if (
          typeof token.expires_at === "number" &&
          Date.now() > token.expires_at
        ) {

          // Optionally, you can remove sensitive fields or mark as expired
          token.id = undefined as any;
          token.role = undefined as any;
          token.access_token = undefined as any;
          token.profile_picture = undefined as any;
          throw new Error("SessionExpired");
        }
      }

      return token;
    },
    async session({ session, token }) {

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.access_token = token.access_token as string;
        session.user.profile_picture = token.profile_picture as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

};
