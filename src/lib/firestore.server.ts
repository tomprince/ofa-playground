import { initializeApp, getApp, deleteApp } from "firebase/app";
import {
	getFirestore,
	collection,
	collectionGroup,
	setDoc,
	doc,
	getDoc,
	getDocs,
	addDoc,
	type CollectionReference,
	type Query,
} from "firebase/firestore/lite";

import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { building } from "$app/environment";

type User = { name: string; discordUID: string };
type Offer = { description: string };

const init = () => {
	if (dev) {
		try {
			deleteApp(getApp());
		} catch {
			// Do nothing
		}
	}
	const app = initializeApp(JSON.parse(env.VITE_FIREBASE_CONFIG));
	const db = getFirestore(app);
	return {
		db,
		users: collection(db, "users") as CollectionReference<User>,
		discordUsers: collection(db, "discordUsers") as CollectionReference<{ uid: string }>,
		allOffers: collectionGroup(db, "offers") as Query<Offer>,
	};
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const firebase = !building ? init() : null!;

export const addUser = async (name: string, discordId: string) => {
	try {
		const user = await addDoc(firebase.users, {
			name: name,
			discordUID: discordId,
		});
		await setDoc(doc(firebase.discordUsers, discordId), { uid: user.id });
		console.log("Document written with ID: ", user.id);
	} catch (e) {
		console.log(e);
	}
};

export const getUserFromDiscord = async (
	discordId: string,
): Promise<{ id: string; name: string } | null> => {
	const d = (await getDoc(doc(firebase.discordUsers, discordId)))?.data();
	if (!d) {
		return null;
	}
	const user = await getDoc(doc(firebase.users, d.uid));
	const userData = user.data();
	if (!userData) {
		return null;
	} else {
		return { id: user.id, ...userData };
	}
};

export const getUser = async (userID: string): Promise<({ id: string } & User) | null> => {
	const r = await getDoc(doc(firebase.users, userID));
	const data = r.data();
	if (data) {
		return {
			id: r.id,
			...data,
		};
	} else {
		return null;
	}
};

export const listUsers = async () => {
	const result = await getDocs(firebase.users);
	return result.docs.map((r) => ({
		id: r.id,
		...r.data(),
	}));
};

export const createOffer = async (userID: string, description: string) => {
	const offers = collection(doc(firebase.users, userID), "offers") as CollectionReference<Offer>;
	await addDoc(offers, { description });
};

export const listOffers = async (
	userID?: string,
): Promise<({ id: string; userID?: string } & Offer)[]> => {
	if (userID) {
		const offers = collection(doc(firebase.users, userID), "offers") as CollectionReference<Offer>;
		const result = await getDocs(offers);
		console.log(result.docs, userID);
		return result.docs.map((r) => ({
			id: r.id,
			...r.data(),
			userID,
		}));
	} else {
		const result = await getDocs(firebase.allOffers);
		return result.docs.map((r) => ({
			id: r.id,
			...r.data(),
			userID: r.ref.parent.parent?.id,
		}));
	}
};
