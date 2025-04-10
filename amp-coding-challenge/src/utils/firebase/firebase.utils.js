import { initializeApp } from "firebase/app";

/**
 * @typedef {import('../../models/user.model').User} User
 */

import {
    getAuth
} from 'firebase/auth';

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz3dZmR0f8E1necsFj1kG2XZUtqcKtjQU",
  authDomain: "amp-coding-challenge.firebaseapp.com",
  projectId: "amp-coding-challenge",
  storageBucket: "amp-coding-challenge.firebasestorage.app",
  messagingSenderId: "704570431457",
  appId: "1:704570431457:web:514512a4f7be3f372c24a0",
  measurementId: "G-MEFGC6VL9G"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth();

export const db = getFirestore();

export const createNewUserDocument = async (userInformation) => {
    const newUserCollectionRef = collection(db, 'users');

    //TODO: may need to check if user exists...

    /** @type {User} */
    const userData = {
        ...userInformation
    }

    try {
        const docRef = await addDoc(newUserCollectionRef, userData)
        return docRef;
    } catch (error) {
        console.log('error creating new user', error.message);
    }
};

export const updateUserDocument = async (userInformation) => {
    const foundDoc = await fetchUserDocumentById(userInformation.id);

    if (!foundDoc) {
        console.error('User document not found');
        return;
    }

    const userDocRef = doc(db, 'users', foundDoc.docId);
    try {
        await updateDoc(userDocRef, {
            ...userInformation
        });
        console.log('User successfully updated');
    } catch (error) {
        console.error('Error updating user: ', error);
    }
}

export const fetchAllUsers = async() => {
    try {
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        /** @type {User[]} */
        const users = querySnapshot.docs.map(doc => ({
            ...doc.data()
        }));

        console.log(users);
        return users;
    } catch (error) {
        console.error('Error fetching users: ', error);
        return [];
    }
};

export const fetchUserById = async(userId) => {
    try {
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        /** @type {User[]} */
        const users = querySnapshot.docs.map(doc => ({
            ...doc.data()
        }));

        const targetUser = users.find(user => user.id === userId);
        return targetUser;
         
    } catch (error) {
        console.error('Error fetching user: ', error);
        return [];
    }
};

export const fetchUserDocumentById = async (userId) => {
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);

    const foundDoc = querySnapshot.docs.find(doc => doc.data().id === userId);

    if (foundDoc) {
        return {
            docId: foundDoc.id,       // Firestore doc ID
            data: foundDoc.data()     // Actual user data
        };
    }

    return null;
};