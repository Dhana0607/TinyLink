// app/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; // <<-- must await
  if (!code) {
    return new Response("Not Found", { status: 404 });
  }

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) {
    return new Response("Not Found", { status: 404 });
  }

  // increment clicks (best-effort)
  try {
    await prisma.link.update({
      where: { code },
      data: { totalClicks: { increment: 1 }, lastClicked: new Date() },
    });
  } catch (err) {
    console.error("Failed incrementing click:", err);
  }

  return NextResponse.redirect(link.url, 302);
}
