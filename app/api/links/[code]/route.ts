// app/api/links/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; // <<-- must await
  if (!code) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = await prisma.link.findUnique({
    where: { code },
    select: { code: true, url: true, totalClicks: true, lastClicked: true, createdAt: true },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(link);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; // <<-- must await
  if (!code) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.link.findUnique({ where: { code } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}
