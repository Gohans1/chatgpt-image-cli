import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import type { Page } from "playwright-core";

export interface DownloadResult {
  filePath: string;
  sizeBytes: number;
  url: string;
}

export async function extractAndSaveImages(
  page: Page,
  imageSelector: string,
  baseOutputPath: string,
  knownUrls: string[] = []
): Promise<DownloadResult[]> {
  const extractedList = await page.evaluate(async ({ selector, existingUrls }) => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(selector));
    const validImages = images.filter((img) => {
      const src = img.src || img.getAttribute("src") || "";
      return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:");
    });

    const knownSet = new Set(existingUrls);
    // Nhóm theo mã file_id để loại bỏ trùng lặp giữa ảnh to và thumbnail
    const fileMap = new Map<string, string>();

    for (const img of validImages) {
      const src = img.src || img.getAttribute("src") || "";
      if (knownSet.has(src)) continue;

      // Trích xuất file id từ URL: ?id=file_...
      const match = src.match(/[?&]id=([^&]+)/);
      const fileKey = match ? match[1] : src;

      if (!fileMap.has(fileKey)) {
        // Đảm bảo URL yêu cầu p=fs (Full Size) nếu là estuary URL
        let fullSizeUrl = src;
        if (fullSizeUrl.includes("backend-api/estuary") && !fullSizeUrl.includes("p=fs")) {
          fullSizeUrl = fullSizeUrl.replace(/[?&]p=[^&]+/, "") + "&p=fs";
        }
        fileMap.set(fileKey, fullSizeUrl);
      }
    }

    if (fileMap.size === 0) {
      // Fallback: nếu không thấy ảnh mới theo knownSet, lấy ảnh cuối cùng
      if (validImages.length > 0) {
        const lastSrc = validImages[validImages.length - 1].src;
        fileMap.set("last", lastSrc);
      } else {
        return [];
      }
    }

    const results: Array<{ base64?: string; error?: string; url: string }> = [];

    for (const [_, url] of fileMap.entries()) {
      try {
        if (url.startsWith("data:")) {
          const parts = url.split(",");
          results.push({ base64: parts[1], url: "data-uri" });
          continue;
        }

        const response = await fetch(url, { mode: "cors", credentials: "include" });
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }
        const blob = await response.blob();

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.includes(",") ? res.split(",")[1] : res);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        results.push({ base64, url });
      } catch (err) {
        results.push({ error: err instanceof Error ? err.message : String(err), url });
      }
    }

    return results;
  }, { selector: imageSelector, existingUrls: knownUrls });

  if (extractedList.length === 0) {
    throw new Error("Không tìm thấy bất kỳ ảnh nào trên trang phù hợp với selector.");
  }

  const parentDir = dirname(baseOutputPath);
  mkdirSync(parentDir, { recursive: true });

  const parsed = parse(baseOutputPath);
  const downloadedResults: DownloadResult[] = [];

  for (let i = 0; i < extractedList.length; i++) {
    const item = extractedList[i];
    if (item.error || !item.base64) {
      console.warn(`⚠️ Bỏ qua 1 ảnh do lỗi tải: ${item.error || "Rỗng"} (${item.url})`);
      continue;
    }

    const buffer = Buffer.from(item.base64, "base64");
    // Nếu chỉ có 1 ảnh: lưu tên file nguyên bản. Nếu nhiều ảnh: thêm hậu tố _1, _2, _3...
    const filePath = extractedList.length === 1
      ? baseOutputPath
      : join(parentDir, `${parsed.name}_${i + 1}${parsed.ext || ".png"}`);

    writeFileSync(filePath, buffer);
    downloadedResults.push({
      filePath,
      sizeBytes: buffer.length,
      url: item.url,
    });
  }

  if (downloadedResults.length === 0) {
    throw new Error("Không thể tải thành công bất kỳ ảnh nào trong lượt này.");
  }

  return downloadedResults;
}
