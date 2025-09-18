export async function GET(
  req: Request,
  ctx: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await ctx.params; // ← await the params

  const base = process.env.NEXT_PUBLIC_PYTHON_API_URL!;
  const url  = `${base}/tiles/counties/${z}/${x}/${y}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    return new Response(await r.text(), { status: r.status });
  }

  const buf = Buffer.from(await r.arrayBuffer());
  return new Response(buf, {
    status: buf.length ? 200 : 204,
    headers: {
      "Content-Type": "application/vnd.mapbox-vector-tile",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
