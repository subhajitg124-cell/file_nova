import { prerender } from "../src/entry-prerender";

async function test() {
  try {
    console.log("Starting test prerender for '/'...");
    const result = await prerender({ url: "/" });
    console.log("Success! Rendered HTML length:", result.html.length);
    console.log("Rendered head payload:", result.head);
  } catch (err) {
    console.error("Prerender failed with error:");
    console.error(err);
  }
}

test();
