import { afterAll, beforeAll, expect, test } from "vitest";
import { setupServer } from "msw/node";
import { delay, http, HttpResponse } from "msw";

const msw = setupServer(
  http.get("https://some-server.com/poll", function* ({ request }) {
    yield HttpResponse.json({ status: "still going" });
    yield HttpResponse.json({ status: "still going" });
    return HttpResponse.json({ status: "done" });
  }),
  http.get("https://some-server.com/pollAsync", async function* ({ request }) {
    await delay();
    yield HttpResponse.json({ status: "still going" });
    yield HttpResponse.json({ status: "still going" });
    return HttpResponse.json({ status: "done" });
  })
);

beforeAll(() => {
  msw.listen();
});
afterAll(() => {
  msw.close();
});

test("(sync) polling succeeds after retries", async () => {
  await expect(
    fetch("https://some-server.com/poll").then((r) => r.json())
  ).resolves.toEqual({ status: "still going" });
  await expect(
    fetch("https://some-server.com/poll").then((r) => r.json())
  ).resolves.toEqual({ status: "still going" });
  await expect(
    fetch("https://some-server.com/poll").then((r) => r.json())
  ).resolves.toEqual({ status: "done" });
});

test("(async) polling succeeds after retries", async () => {
  await expect(
    fetch("https://some-server.com/pollAsync").then((r) => r.json())
  ).resolves.toEqual({ status: "still going" });
  await expect(
    fetch("https://some-server.com/pollAsync").then((r) => r.json())
  ).resolves.toEqual({ status: "still going" });
  await expect(
    fetch("https://some-server.com/pollAsync").then((r) => r.json())
  ).resolves.toEqual({ status: "done" });
});
