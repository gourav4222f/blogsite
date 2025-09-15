"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FollowButton } from "@/components/app/FollowButton";

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface UserRow {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  isFollowing: boolean;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const url = useMemo(() => {
    const usp = new URLSearchParams();
    if (debouncedQuery.trim()) usp.set("q", debouncedQuery.trim());
    return "/api/users/search" + (usp.toString() ? `?${usp.toString()}` : "");
  }, [debouncedQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((json) => {
        if (!active) return;
        setData(json);
      })
      .catch((e) => {
        if (!active) return;
        setError(e.message || "Something went wrong");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search users..."
        className="w-full rounded-md max-w-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 dark:border-gray-700 dark:bg-neutral-900"
      />

      {open && (
      <div className="absolute left-0  w-[20vw] top-[calc(100%+0.5rem)] z-50 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-950 shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-0"></TableHead>
                <TableHead className="w-full"></TableHead>
                <TableHead className="w-0 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((u) => {
                  const initials = (u.name || u.username || "?")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <TableRow key={u.id}>
                      {/* Left: Avatar */}
                      <TableCell className="align-middle">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.image || undefined} alt={u.username || u.name || "User"} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      {/* Center: Name and Username */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-base leading-tight truncate">
                            {u.name || u.username || "User"}
                          </span>
                          {u.username ? (
                            <Link
                              href={`/${u.username}`}
                              className="text-gray-500 text-sm hover:underline truncate"
                              title={`Open @${u.username}'s profile`}
                            >
                              @{u.username}
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      {/* Right: Follow Button */}
                      <TableCell className="text-right align-middle">
                        <FollowButton targetUserId={u.id} initialIsFollowing={u.isFollowing} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
