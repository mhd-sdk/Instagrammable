import { createReadStream, existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import type { IStorage, StreamFileResponse } from "./storage.interface";

export class LocalStorage implements IStorage {
  private readonly baseDir: string;

  constructor(baseDir: string = "./uploads") {
    this.baseDir = path.resolve(baseDir);
    this.ensureBaseDir();
  }

  private async ensureBaseDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create upload directory:", error);
    }
  }

  private getFilePath(key: string): string {
    return path.join(this.baseDir, key);
  }

  private async ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  async upload(
    key: string,
    data: Buffer,
    contentType: string = "application/octet-stream"
  ): Promise<void> {
    const filePath = this.getFilePath(key);
    await this.ensureDir(filePath);
    await fs.writeFile(filePath, data);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    return existsSync(filePath);
  }

  async getStream(
    key: string,
    rangeHeader: string | null
  ): Promise<StreamFileResponse> {
    const filePath = this.getFilePath(key);

    if (!existsSync(filePath)) {
      throw new Error("File not found");
    }

    const stats = await fs.stat(filePath);
    const contentLength = stats.size;

    let start = 0;
    let end = contentLength - 1;
    let contentRange: string | undefined;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : end;
      contentRange = `bytes ${start}-${end}/${contentLength}`;
    }

    const fileStream = createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(fileStream) as ReadableStream;

    return {
      stream: webStream,
      contentLength: end - start + 1,
      contentType: this.getContentType(filePath),
      contentRange,
    };
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
    };
    return contentTypes[ext] || "application/octet-stream";
  }

  async getPresignedUrl(key: string): Promise<string> {
    // Pour le stockage local, on retourne une URL serveur qui servira le fichier
    return `/api/uploads/${encodeURIComponent(key)}`;
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string = "application/octet-stream"
  ): Promise<string> {
    // Pour le stockage local, on retourne une URL serveur qui acceptera l'upload
    return `/api/uploads/${encodeURIComponent(key)}`;
  }
}
