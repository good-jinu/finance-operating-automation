import * as fs from "node:fs/promises";
import { authenticate } from "@google-cloud/local-auth";
import type { OAuth2Client } from "google-auth-library";
import { type gmail_v1, google } from "googleapis";
import { CREDENTIALS_PATH, SCOPES, TOKEN_PATH } from "../utils/config";
import { join }	from "node:path";

// biome-ignore lint:suspicious/noExplicitAny
async function loadToken(): Promise<any | null> {
	try {
		const token = await fs.readFile(TOKEN_PATH, "utf-8");
		return JSON.parse(token);
	} catch (err) {
		console.log("Error loading token: ", err);
		return null;
	}
}

// biome-ignore lint:suspicious/noExplicitAny
async function saveToken(token: any): Promise<void> {
	await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
}

export async function getCredentials(): Promise<OAuth2Client> {
	const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, "utf-8"));
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		redirect_uris[0],
	);

	const token = await loadToken();
	if (token) {
		oAuth2Client.setCredentials(token);
		return oAuth2Client;
	}

	console.log("oAuth2Client", oAuth2Client);

	const newClient = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});

	console.log("newClient", newClient);

	if (newClient.credentials) {
		oAuth2Client.setCredentials(newClient.credentials);
		await saveToken(newClient.credentials);
	}
	// The 'authenticate' function returns a different kind of client.
	// We need to return the one from google.auth.OAuth2
	return oAuth2Client;
}

/**
 * Gmail API service 객체를 생성합니다.
 */
export function buildGmailService(auth: OAuth2Client): gmail_v1.Gmail {
	return google.gmail({ version: "v1", auth });
}
