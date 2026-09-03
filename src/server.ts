import { readFileSync } from "node:fs";
import { generateImage } from "./generator.js";

const PORT = Number(process.env.PORT || 3000);

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, User-Agent",
};

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/$/, "");

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check endpoint
    if (pathname === "/health" || pathname === "/api/health") {
      return Response.json(
        { status: "ok", service: "chatgpt-image-bridge", timestamp: Date.now() },
        { headers: corsHeaders }
      );
    }

    // OpenAI Models list
    if (pathname === "/v1/models" || pathname === "/models") {
      return Response.json(
        {
          object: "list",
          data: [
            { id: "gpt-image-2", object: "model", owned_by: "chatgpt-web" },
            { id: "gpt-image", object: "model", owned_by: "chatgpt-web" },
          ],
        },
        { headers: corsHeaders }
      );
    }

    // OpenAI Images Generations endpoint: /v1/images/generations or /images/generations
    if (
      (pathname === "/v1/images/generations" || pathname === "/images/generations") &&
      req.method === "POST"
    ) {
      try {
        const body = (await req.json().catch(() => ({}))) as Record<string, any>;
        const prompt = body.prompt;

        if (!prompt || typeof prompt !== "string") {
          return Response.json(
            { error: { message: "Prompt is required", type: "invalid_request_error" } },
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`\n📥 [Bridge] Nhận request tạo ảnh từ iLab CONJURE!`);
        console.log(`📝 Prompt: "${prompt}"`);

        // Chạy sinh ảnh qua Playwright (chạy headless)
        const results = await generateImage(prompt, { headless: true });

        console.log(`✅ [Bridge] Đã tạo thành công ${results.length} ảnh. Đang chuyển đổi Base64 trả về...`);

        const dataItems = results.map((item) => {
          const buffer = readFileSync(item.filePath);
          return {
            b64_json: buffer.toString("base64"),
            revised_prompt: prompt,
            output_format: "png",
          };
        });

        return Response.json(
          {
            created: Math.floor(Date.now() / 1000),
            data: dataItems,
          },
          { headers: corsHeaders }
        );
      } catch (err) {
        console.error("❌ [Bridge] Lỗi khi tạo ảnh:", err);
        return Response.json(
          {
            error: {
              message: err instanceof Error ? err.message : String(err),
              type: "server_error",
            },
          },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return Response.json(
      { error: { message: `Endpoint ${pathname} not found`, code: 404 } },
      { status: 404, headers: corsHeaders }
    );
  },
});

console.log("=================================================");
console.log(`🚀 ChatGPT Image Local Bridge Server đã sẵn sàng!`);
console.log(`📡 URL lắng nghe: http://127.0.0.1:${PORT}`);
console.log(`🔌 OpenAI Base URL cho iLab CONJURE: http://127.0.0.1:${PORT}/v1`);
console.log(`📌 Endpoint: http://127.0.0.1:${PORT}/v1/images/generations`);
console.log("=================================================");
