export async function GET(
  req: Request,
  ctx: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await ctx.params; // ← await the params

  const base = process.env.NEXT_PUBLIC_MAP_API_URL!;
  const url  = `${base}/tiles/counties/${z}/${x}/${y}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    return new Response(await r.text(), { status: r.status });
  }

  const buf = Buffer.from(await r.arrayBuffer());
  
  // If buffer is empty, return 204 without content
  if (buf.length === 0) {
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }
  
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.mapbox-vector-tile",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
