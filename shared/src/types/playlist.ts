export type Visibility = "private" | "friends" | "public";

export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  coverUrl: string;
  visibility: Visibility;
  collaborators: string[];
  trackIds: string[];
  createdBy: "user" | "ai";
  generatorPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollaboratorInvite {
  id: string;
  playlistId: string;
  inviterId: string;
  inviteeId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  respondedAt?: string;
}
