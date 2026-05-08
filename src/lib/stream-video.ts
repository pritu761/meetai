import "server-only";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
const secret = process.env.STREAM_VIDEO_SECRET_KEY;
const basePath = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_URL;

if (!apiKey) {
  throw new Error("Missing NEXT_PUBLIC_STREAM_VIDEO_API_KEY");
}

if (!secret) {
  throw new Error("Missing STREAM_VIDEO_SECRET_KEY");
}

export const streamVideo = new StreamClient(
  apiKey,
  secret
);
