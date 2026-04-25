export type ActivityType = "liked" | "played" | "playlist_created" | "followed" | "commented";

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface FollowEdge {
  id: string;
  followerId: string;
  followeeId: string;
  createdAt: string;
}

export type CommentTarget = "track" | "playlist";

export interface Comment {
  id: string;
  targetType: CommentTarget;
  targetId: string;
  userId: string;
  text: string;
  createdAt: string;
}
