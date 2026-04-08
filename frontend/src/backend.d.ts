import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: bigint;
    mimeType: string;
    filename: string;
    storageRef: ExternalBlob;
    customOrder: bigint;
    uploadDate: Time;
}
export type Time = bigint;
export type PhotoId = bigint;
export type DeleteAlbumResponse = {
    __kind__: "permissionDenied";
    permissionDenied: string;
} | {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: string;
};
export interface AlbumEntryInput {
    contentId: bigint;
    position: bigint;
    isVideo: boolean;
}
export interface Album {
    id: bigint;
    contents: Array<AlbumContentEntry>;
    name: string;
}
export interface VideoUploadInput {
    content: ExternalBlob;
    filename: string;
}
export interface AlbumContentEntry {
    contentId: bigint;
    position: bigint;
    isVideo: boolean;
}
export interface PhotoUploadInput {
    content: ExternalBlob;
    filename: string;
}
export interface AlbumInput {
    name: string;
}
export type AlbumId = bigint;
export interface UserProfile {
    name: string;
}
export interface Photo {
    id: bigint;
    filename: string;
    storageRef: ExternalBlob;
    customOrder: bigint;
    uploadDate: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEntryToAlbum(albumId: AlbumId, entryInput: AlbumEntryInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlbum(albumInput: AlbumInput): Promise<AlbumId>;
    deleteAlbum(albumId: bigint): Promise<DeleteAlbumResponse>;
    deletePhoto(photoId: bigint): Promise<void>;
    deleteVideo(videoId: bigint): Promise<void>;
    getAllAlbums(): Promise<Array<Album>>;
    getAllPhotos(): Promise<Array<Photo>>;
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    movePhotoToAlbum(photoId: PhotoId, albumId: AlbumId): Promise<void>;
    rearrangePhotos(photoIds: Array<bigint>): Promise<void>;
    rearrangeVideos(videoIds: Array<bigint>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadPhoto(photo: PhotoUploadInput): Promise<void>;
    uploadVideo(input: VideoUploadInput): Promise<void>;
}
