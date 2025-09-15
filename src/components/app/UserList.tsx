import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FollowButton } from "./FollowButton";

interface UserListProps {
  users: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    isFollowing: boolean;
  }[];
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <p className="p-4 text-center text-gray-500">No users to display.</p>
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <div key={user.id} className="p-4 flex justify-between items-center">
          <Link href={`/${user.username}`} className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold hover:underline">{user.name}</p>
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </Link>
          <FollowButton
            targetUserId={user.id}
            initialIsFollowing={user.isFollowing}
          />
        </div>
      ))}
    </div>
  );
}
