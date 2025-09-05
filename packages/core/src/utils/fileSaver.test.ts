import * as fs from "node:fs";
import * as path from "node:path";
import type { gmail_v1 } from "googleapis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { extractAllAttachments, saveAttachment } from "./fileSaver";

vi.mock("node:fs");

describe("fileSaver", () => {
	const messageId = "test-message-id";
	const filename = "test-file.txt";
	const buffer = Buffer.from("hello world");
	const MOCK_FILE_PATH = ".storage/files";

	beforeEach(() => {
		vi.spyOn(process, "cwd").mockReturnValue("/app");
		vi.spyOn(fs, "existsSync").mockReturnValue(false);
		vi.spyOn(fs, "mkdirSync").mockReturnValue(undefined);
		vi.spyOn(fs, "writeFileSync").mockReturnValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("saveAttachment", () => {
		it("should create a directory if it does not exist", () => {
			saveAttachment(messageId, filename, buffer);
			const expectedDir = path.join("/app", MOCK_FILE_PATH, messageId);
			expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, {
				recursive: true,
			});
		});

		it("should save the file with the correct path and content", () => {
			saveAttachment(messageId, filename, buffer);
			const expectedPath = path.join(
				"/app",
				MOCK_FILE_PATH,
				messageId,
				filename,
			);
			expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, buffer);
		});

		it("should return the full path of the saved file", () => {
			const result = saveAttachment(messageId, filename, buffer);
			const expectedPath = path.join(
				"/app",
				MOCK_FILE_PATH,
				messageId,
				filename,
			);
			expect(result).toBe(expectedPath);
		});

		it("should throw an error if file writing fails", () => {
			const error = new Error("Failed to write file");
			vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
				throw error;
			});
			expect(() => saveAttachment(messageId, filename, buffer)).toThrow(error);
		});
	});

	describe("extractAllAttachments", () => {
		it("should extract a single attachment", () => {
			const payload: gmail_v1.Schema$MessagePart = {
				filename: "attachment1.pdf",
				mimeType: "application/pdf",
				body: { attachmentId: "att1" },
			};
			const result = extractAllAttachments(payload);
			expect(result).toEqual([
				{
					filename: "attachment1.pdf",
					mimeType: "application/pdf",
					attachmentId: "att1",
				},
			]);
		});

		it("should extract multiple attachments from nested parts", () => {
			const payload: gmail_v1.Schema$MessagePart = {
				parts: [
					{
						filename: "attachment1.pdf",
						mimeType: "application/pdf",
						body: { attachmentId: "att1" },
					},
					{
						parts: [
							{
								filename: "attachment2.txt",
								mimeType: "text/plain",
								body: { attachmentId: "att2" },
							},
						],
					},
				],
			};
			const result = extractAllAttachments(payload);
			expect(result).toEqual([
				{
					filename: "attachment1.pdf",
					mimeType: "application/pdf",
					attachmentId: "att1",
				},
				{
					filename: "attachment2.txt",
					mimeType: "text/plain",
					attachmentId: "att2",
				},
			]);
		});

		it("should return an empty array if there are no attachments", () => {
			const payload: gmail_v1.Schema$MessagePart = {
				parts: [{ mimeType: "text/plain" }],
			};
			const result = extractAllAttachments(payload);
			expect(result).toEqual([]);
		});

		it("should handle payloads with no parts", () => {
			const payload: gmail_v1.Schema$MessagePart = {
				filename: "",
				body: { attachmentId: "" },
			};
			const result = extractAllAttachments(payload);
			expect(result).toEqual([]);
		});
	});
});
