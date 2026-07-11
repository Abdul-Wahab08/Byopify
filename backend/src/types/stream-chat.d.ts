import "stream-chat";

declare module "stream-chat" {
  interface CustomMessageData {
    video_invite?: boolean;
    video_invite_join_url?: string;
  }

  interface CustomChannelData {
    name?: string;
  }
}