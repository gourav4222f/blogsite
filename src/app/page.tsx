"use client";

import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSession } from 'next-auth/react';
import { CreatePostForm } from "@/components/app/CreatePostForm";
import { PostCard } from "@/components/app/PostCard";
import { UserSearch } from "@/components/app/UserSearch";
import { FcAbout } from "react-icons/fc";
import type { Following, PaginatedResponse } from '@/types';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useMediaQuery } from 'react-responsive';
import { tablet } from '@/utils/mediaQueries';

type User = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  image: string | null;
};

type PostWithDetails = {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  authorId: string;
  likes: { userId: string }[];
  reposts: { userId: string }[];
  _count: {
    likes: number;
    comments: number;
    reposts: number;
  };
};

type TimelineItem = {
  type: 'post' | 'repost';
  item: PostWithDetails & { 
    post?: PostWithDetails; 
    user?: User;
  };
  author: User;
};

const POSTS_PER_PAGE = 5;

export default function Home() {
  const { data: session, status } = useSession();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = session?.user?.id;
  const isTablet = useMediaQuery(tablet);

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: POSTS_PER_PAGE.toString(),
        sortBy: currentUserId ? 'createdAt' : 'likes',
        order: 'desc',
        ...(currentUserId && { userId: currentUserId })
      });

      if (currentUserId) {
        // For logged-in users, get following users' posts
        const followingRes = await fetch(`/api/following`);
        const following: Following[] = await followingRes.json();
        const followingIds = following.map((f) => f.followingId);
        params.append('followingIds', followingIds.join(','));
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data: PaginatedResponse<PostWithDetails> = await response.json();
      
      const newItems: TimelineItem[] = data.posts.map((post) => ({
        type: 'post' as const,
        item: {
          ...post,
          authorId: post.author.id,
        },
        author: post.author,
      }));

      setTimeline(prev => pageNum === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const loadMorePosts = () => {
    if (!isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      fetchPosts(1);
    }
  }, [status, fetchPosts]);

  return (
    <main>
       
          {session ? (
            null
          ) : (
            <div className="border-b p-4 flex items-center justify-center gap-2 sticky top-0 z-50">
              <div className="text-center text-gray-900 bg-blue-100 p-2 flex  items-center justify-center gap-2 w-full rounded-2xl">
              
              <Tooltip>
  <TooltipTrigger>
    {isTablet ? (
      <FcAbout className="text-3xl" />
    ) : (
      <FcAbout className="text-xl" />
    )}
  </TooltipTrigger>
  <TooltipContent>
    <p>Sign in to post and see your personalized feed.</p>
  </TooltipContent>
</Tooltip>
            <p className="text-center text-sm">
              Sign in to post and see your personalized feed.
            </p>
              </div>
        </div>
          )}

      <div className="mx-auto max-w-screen-xl">
        <header className="p-4 flex justify-between items-center gap-4 flex-col md:flex-row">
          
            <div className="w-full">
              <UserSearch />
            </div>          
        </header>
        
        <div className="border-b p-4">
          {session ? (
            <CreatePostForm />
          ) : (
            null
          )}
        </div>
       

        <div className="space-y-0 sm:space-y-4">
          <InfiniteScroll
            dataLength={timeline.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={
              <div className="p-4 text-center text-gray-500">
                Loading more posts...
              </div>
            }
            endMessage={
              <p className="p-4 text-center text-gray-500">
                {timeline.length === 0 ? 'No posts to show' : 'No more posts to load'}
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {timeline.map((timelineItem) => (
              <div key={`${timelineItem.type}-${timelineItem.item.id}`} className="border-b">
                <PostCard
                  post={timelineItem.item}
                  currentUserId={currentUserId}
                  repostedBy={timelineItem.type === 'repost' ? timelineItem.author : undefined}
                />
              </div>
            ))}
          </InfiniteScroll>
          
          {isLoading && timeline.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Loading posts...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
