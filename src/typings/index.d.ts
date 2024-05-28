import { FieldValues } from 'react-hook-form'

// UTILITIES //

type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property];
};

//  PRIMITIVES  //

export type BasicId = string & { length: 6 }
export type UserId = BasicId
export type WishId = BasicId
export type WishlistId = BasicId
export type ImageId = BasicId
// export type PasswordResetCode = string & { length: 6 }
export type InvitationCode = string & { length: 11 }

export type Timestamp = number

type Day = number
type Month = number
type Year = number
export type DateArray = [Day, Month, Year]

//  QUERY RETURNS  //

export interface User {
    key?: UserId;   // обрабатывается сервером
    id: UserId;
    name: string;
    email: string;
    // password?: string;
    wishes: WishId[];
    reservations: WishId[];
    wishlists: WishlistId[];
    invites: WishlistId[];
    imageExtension: 'png' | 'jpg' | null;
    signedAt: Timestamp;
    lastActivityAt: Timestamp
}

export interface WishDefaultValues {
    title: string;
    description: string;
    external: string;
    imageExtension: 'png' | 'jpg' | null;
    imageAR: number;
    stars: 0 | 1 | 2 | 3;
    price: number | null;
    currency: 'rouble' | 'dollar' | 'euro';
    inWishlists: WishlistId[];
    reservedBy: UserId | null;
    isCompleted: boolean;
    completedAt: Timestamp | null
    createdAt: Timestamp | null;
    id?: WishId;
    author?: UserId;
    lastModifiedAt?: Timestamp
}

export interface Wish extends WishDefaultValues {
    id: WishId;
    author: UserId;
    key?: WishId;                       // обрабатывается сервером
}


export interface WishlistDefaultValues extends FieldValues {
    title: string;
    description: string;
    wishes: WishId[];
    guests: UserId[];
    date: DateArray;
    id?: WishlistId;
    author?: UserId;
    invitationCode?: InvitationCode
}

export interface Wishlist extends WishlistDefaultValues {
    id: WishlistId;
    author: UserId;
    guests: UserId[];
    invitationCode?: InvitationCode;    // undefined для invites
    key?: WishlistId;                   // обрабатывается сервером
}

export interface WidthAwared {
    getWidth(): number | undefined
}
