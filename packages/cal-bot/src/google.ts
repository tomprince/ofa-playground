import { getAccessToken, type Credentials } from "web-auth-library/google";
import type { calendar_v3 } from "googleapis";

export async function makeRequest<ResponseType>(
	route: string,
	init: RequestInit,
): Promise<ResponseType> {
	const response = await fetch(route, init);
	if (!response.ok) {
		const text = await response.text();
		try {
			const json = JSON.parse(text);
			console.log("Error making request to google:", json);
			throw json;
		} catch {
			console.log("Error making request to google:", text);
			throw text;
		}
	}
	return response.json();
}

interface TokenInfo {
	access_token: string;
	token_type: string;
}

export class GoogleToken {
	constructor(private data: TokenInfo) {}

	getHeaders() {
		return {
			Authorization: `${this.data.token_type} ${this.data.access_token}`,
		};
	}
}

export async function getServiceToken(
	credentials: Credentials,
	scope: string[],
	waitUntil: ExecutionContext["waitUntil"],
) {
	const access_token = await getAccessToken({
		credentials,
		scope,
		waitUntil,
	});
	return new GoogleToken({ access_token, token_type: "Bearer" });
}

export async function insertEvent(
	googleToken: GoogleToken,
	calendarId: string,
	event: calendar_v3.Schema$Event,
): Promise<calendar_v3.Schema$Event> {
	return makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/`, {
		headers: {
			...googleToken.getHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(event),
		method: "POST",
	});
}

export async function patchEvent(
	googleToken: GoogleToken,
	calendarId: string,
	eventId: string,
	event: calendar_v3.Schema$Event,
): Promise<calendar_v3.Schema$Event> {
	return makeRequest(
		`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
		{
			headers: {
				...googleToken.getHeaders(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify(event),
			method: "PATCH",
		},
	);
}

export async function insertCalendarList(
	googleToken: GoogleToken,
	calendarId: string,
): Promise<calendar_v3.Schema$CalendarListEntry> {
	return makeRequest(`https://www.googleapis.com/calendar/v3/users/me/calendarList/`, {
		headers: {
			...googleToken.getHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: calendarId }),
		method: "POST",
	});
}
