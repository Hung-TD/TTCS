import { NextResponse } from "next/server";

// Danh sách ảnh trong public/
const images = ["/exam1.png", "/exam2.png", "/exam3.png"];

export async function GET() {
  // Chọn ảnh ngẫu nhiên
  const randomImage = images[Math.floor(Math.random() * images.length)];

  return NextResponse.json({ image: randomImage });
}
