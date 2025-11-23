// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let c = "";
  for (let i = 0; i < length; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export async function GET() {
  // list all links
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    select: { code: true, url: true, totalClicks: true, lastClicked: true, createdAt: true },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = (body?.url || "").trim();
    let code = body?.code?.trim() ?? "";

    // Validate URL
    try {
      // will throw if invalid
      // allow http/https only
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "URL must use http or https" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // If custom code passed, validate format
    if (code) {
      if (!CODE_REGEX.test(code)) {
        return NextResponse.json({ error: "Custom code must match [A-Za-z0-9]{6,8}" }, { status: 400 });
      }
      // ensure lowercase/uppercase kept as-is (spec doesn't force case)
    } else {
      // generate until unique (rare collision)
      let tries = 0;
      do {
        code = generateCode(6 + Math.floor(Math.random() * 3)); // 6-8 chars random
        const exists = await prisma.link.findUnique({ where: { code } });
        if (!exists) break;
        tries++;
      } while (tries < 5);
    }

    // create link
    try {
      const link = await prisma.link.create({
        data: { code, url },
        select: { code: true, url: true, totalClicks: true, lastClicked: true, createdAt: true },
      });

      return NextResponse.json(link, { status: 201 });
    } catch (err: any) {
      // unique constraint error
      if (err?.code === "P2002") {
        return NextResponse.json({ error: "Code already exists" }, { status: 409 });
      }
      console.error(err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
