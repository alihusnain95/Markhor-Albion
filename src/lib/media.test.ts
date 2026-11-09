import { describe, it, expect } from "vitest";
import { toEmbedUrl, youtubeThumb } from "./media";

describe("video embeds", () => {
  it("accepts YouTube watch, short and youtu.be links", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(toEmbedUrl("https://youtu.be/dQw4w9WgXcQ?t=3")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(toEmbedUrl("https://youtube.com/shorts/abcDEF12345")).toBe("https://www.youtube-nocookie.com/embed/abcDEF12345");
  });
  it("accepts Vimeo links", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871");
  });
  it("rejects other sites and junk", () => {
    expect(toEmbedUrl("https://evil.example/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(toEmbedUrl("not a url")).toBeNull();
  });
  it("builds a YouTube thumbnail", () => {
    expect(youtubeThumb("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });
});
