import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Recursively find and convert all Firestore Timestamp objects to ISO strings.
export const serializeFirestoreData = (obj: any): any => {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }

    // Check if it's a Firestore Timestamp
    if (obj.toDate && typeof obj.toDate === 'function') {
        return obj.toDate().toISOString();
    }

    // If it's an array, serialize each item
    if (Array.isArray(obj)) {
        return obj.map(serializeFirestoreData);
    }
    
    // If it's an object, serialize each value
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = serializeFirestoreData(obj[key]);
        }
    }
    return newObj;
}
