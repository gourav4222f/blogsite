export type Following = {
  followingId: string;
};

export type PaginatedResponse<T> = {
  posts: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
};
