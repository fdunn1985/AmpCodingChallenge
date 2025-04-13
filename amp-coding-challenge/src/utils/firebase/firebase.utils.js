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

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

export const db = getFirestore(firebaseApp);

export const createNewUserDocument = async (userInformation) => {
    const newUserCollectionRef = collection(db, 'users');

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

export const createNewRecentActivityDocument = async (activityInformation) => {
    const newActivityCollectionRef = collection(db, 'activities');

    const activityData = {
        ...activityInformation
    }

    try {
        const docRef = await addDoc(newActivityCollectionRef, activityData)
        return docRef;
    } catch (error) {
        console.log('error creating new activity', error.message);
    }
};

export const fetchAllRecentActivities = async() => {
    try {
        const activitiesCollectionRef = collection(db, 'activities');
        const querySnapshot = await getDocs(activitiesCollectionRef);

        const activities = querySnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                action: data.action || 'Unknown',
                userId: data.userId || '',
                userName: data.userName || 'Anonymous',
                timestamp: data.timestamp?.toDate() || null
            };
        });

        console.log("Activity in firebase: ", activities);

        // Sort by most recent date
        const sortedActivities = activities.sort((activityA, activityB) => {
            const timeA = activityA.timestamp || new Date(0);
            const timeB = activityB.timestamp || new Date(0);

            if (timeA > timeB) return -1; // A comes before B
            if (timeA < timeB) return 1;  // B comes before A
            return 0; // They are the same
        });

        console.log(sortedActivities);
        return sortedActivities;
    } catch (error) {
        console.error('Error fetching activities: ', error);
        return [];
    }
};