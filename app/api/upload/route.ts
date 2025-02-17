import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import prisma from "@/prisma/prisma"; // Adjust this based on your ORM setup

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string; // Ensure user ID is passed

    if (!file || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`; // Store this in the DB

    // ✅ Update the user's profile in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: { avatar: imageUrl }, // Update the avatar in the profile
        },
      },
    });

    return NextResponse.json({ url: imageUrl, user: updatedUser });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
