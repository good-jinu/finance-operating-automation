import * as fs from "node:fs";
import * as path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AttachmentInfo } from "./fileReader";
import {
	getMimeType,
	readAttachment,
	readAttachments,
	readFileAsBase64,
} from "./fileReader";

vi.mock("node:fs");
vi.mock("node:path");

describe("fileReader", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("getMimeType", () => {
		it("should return the correct MIME type for a given file extension", () => {
			vi.spyOn(path, "extname").mockImplementation(
				(p: string) => `.${p.split(".").pop() || ""}`,
			);
			expect(getMimeType("file.txt")).toBe("text/plain");
			expect(getMimeType("document.pdf")).toBe("application/pdf");
			expect(getMimeType("image.jpg")).toBe("image/jpeg");
			expect(getMimeType("image.jpeg")).toBe("image/jpeg");
			expect(getMimeType("logo.png")).toBe("image/png");
			expect(getMimeType("animated.gif")).toBe("image/gif");
			expect(getMimeType("photo.webp")).toBe("image/webp");
			expect(getMimeType("data.csv")).toBe("text/csv");
			expect(getMimeType("config.json")).toBe("application/json");
			expect(getMimeType("archive.zip")).toBe("application/zip");
			expect(getMimeType("unknown.ext")).toBe("application/octet-stream");
			expect(getMimeType("file_without_extension")).toBe(
				"application/octet-stream",
			);
		});
	});

	describe("readFileAsBase64", () => {
		it("should read a file and return its base64 representation", () => {
			const filePath = "test.txt";
			const fileContent = "Hello, world!";
			const base64Content = Buffer.from(fileContent).toString("base64");

			vi.spyOn(path, "join").mockReturnValue(filePath);
			vi.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from(fileContent));

			const result = readFileAsBase64(filePath);

			expect(path.join).toHaveBeenCalledWith(
				process.cwd(),
				".storage/files",
				filePath,
			);
			expect(fs.readFileSync).toHaveBeenCalledWith(filePath);
			expect(result).toBe(base64Content);
		});
	});

	describe("readAttachment", () => {
		it("should read an attachment and return an AttachmentInfo object", () => {
			const filePath = "path/to/attachment.pdf";
			const fileName = "attachment.pdf";
			const mimeType = "application/pdf";
			const fileContent = "This is a test PDF.";
			const base64Content = Buffer.from(fileContent).toString("base64");

			vi.spyOn(path, "basename").mockReturnValue(fileName);
			vi.spyOn(path, "join").mockReturnValue(filePath);
			vi.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from(fileContent));
			// We need to mock getMimeType because it uses path.extname
			vi.spyOn(path, "extname").mockReturnValue(".pdf");

			const result = readAttachment(filePath);

			expect(path.basename).toHaveBeenCalledWith(filePath);
			expect(path.join).toHaveBeenCalledWith(
				process.cwd(),
				".storage/files",
				filePath,
			);
			expect(fs.readFileSync).toHaveBeenCalledWith(filePath);
			expect(result).toEqual({
				fileName,
				mimeType,
				fileData: base64Content,
			});
		});
	});

	describe("readAttachments", () => {
		it("should read multiple attachments and return an array of AttachmentInfo objects", () => {
			const filePaths = ["file1.txt", "file2.png"];
			const file1Content = "file1";
			const file2Content = "file2";
			const base64Content1 = Buffer.from(file1Content).toString("base64");
			const base64Content2 = Buffer.from(file2Content).toString("base64");

			const attachment1: AttachmentInfo = {
				fileName: "file1.txt",
				mimeType: "text/plain",
				fileData: base64Content1,
			};
			const attachment2: AttachmentInfo = {
				fileName: "file2.png",
				mimeType: "image/png",
				fileData: base64Content2,
			};

			vi.spyOn(path, "basename")
				.mockReturnValueOnce("file1.txt")
				.mockReturnValueOnce("file2.png");

			vi.spyOn(path, "join")
				.mockReturnValueOnce("path/to/file1.txt")
				.mockReturnValueOnce("path/to/file2.png");

			vi.spyOn(fs, "readFileSync")
				.mockReturnValueOnce(Buffer.from(file1Content))
				.mockReturnValueOnce(Buffer.from(file2Content));

			vi.spyOn(path, "extname")
				.mockReturnValueOnce(".txt")
				.mockReturnValueOnce(".png");

			const result = readAttachments(filePaths);

			expect(result).toEqual([attachment1, attachment2]);
		});

		it("should handle errors when reading attachments and skip the failed ones", () => {
			const filePaths = ["good.txt", "bad.txt", "another-good.pdf"];
			const goodContent = "good file";
			const anotherGoodContent = "another good file";
			const base64Good = Buffer.from(goodContent).toString("base64");
			const base64AnotherGood =
				Buffer.from(anotherGoodContent).toString("base64");

			const goodAttachment: AttachmentInfo = {
				fileName: "good.txt",
				mimeType: "text/plain",
				fileData: base64Good,
			};
			const anotherGoodAttachment: AttachmentInfo = {
				fileName: "another-good.pdf",
				mimeType: "application/pdf",
				fileData: base64AnotherGood,
			};

			vi.spyOn(path, "basename")
				.mockReturnValueOnce("good.txt")
				.mockReturnValueOnce("bad.txt")
				.mockReturnValueOnce("another-good.pdf");

			vi.spyOn(path, "join")
				.mockReturnValueOnce("path/to/good.txt")
				.mockReturnValueOnce("path/to/bad.txt") // This will be used in the try block
				.mockReturnValueOnce("path/to/bad.txt") // This will be used in the catch block
				.mockReturnValueOnce("path/to/another-good.pdf");

			vi.spyOn(fs, "readFileSync")
				.mockReturnValueOnce(Buffer.from(goodContent))
				.mockImplementationOnce(() => {
					throw new Error("bad file");
				})
				.mockReturnValueOnce(Buffer.from(anotherGoodContent));

			vi.spyOn(path, "extname")
				.mockReturnValueOnce(".txt")
				.mockReturnValueOnce(".pdf");

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const result = readAttachments(filePaths);

			expect(result).toEqual([goodAttachment, anotherGoodAttachment]);
			expect(consoleErrorSpy).toHaveBeenCalledOnce();
		});
	});
});
