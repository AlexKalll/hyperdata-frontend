import React from "react";
import { Session } from "next-auth";

interface UserProfileProps {
  session: Session | null;
  isSidebarOpen: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  session,
  isSidebarOpen,
}) => {
  if (!session?.user) {
    return isSidebarOpen ? (
      <p className="text-gray-600">Not signed in</p>
    ) : null;
  }

  const { user } = session;

  return (
    <div className="flex items-center space-x-2">
      {isSidebarOpen && (
        <>
          <img
            src={user.profile_picture || "/default-avatar.png"}
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
          <div>
            <p className="text-gray-700">{user.name || user.username}</p>
            <p className="text-sm text-gray-500">{(user.role || " ").replace("SuperAdmin", "Admin")}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
