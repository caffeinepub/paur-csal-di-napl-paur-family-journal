import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Video = {
    id : Nat;
    filename : Text;
    uploadDate : Time.Time;
    storageRef : Storage.ExternalBlob;
    customOrder : Nat;
    mimeType : Text;
  };

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      Nat.compare(video1.customOrder, video2.customOrder);
    };
  };

  type Photo = {
    id : Nat;
    filename : Text;
    uploadDate : Time.Time;
    storageRef : Storage.ExternalBlob;
    customOrder : Nat;
  };

  module Photo {
    public func compare(photo1 : Photo, photo2 : Photo) : Order.Order {
      Nat.compare(photo1.customOrder, photo2.customOrder);
    };
  };

  type AlbumContentEntry = {
    isVideo : Bool;
    contentId : Nat;
    position : Nat;
  };

  type Album = {
    id : Nat;
    name : Text;
    contents : [AlbumContentEntry];
  };

  module Album {
    public func compare(album1 : Album, album2 : Album) : Order.Order {
      Nat.compare(album1.id, album2.id);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let videoStorage = Map.empty<VideoId, Video>();
  let photoStorage = Map.empty<PhotoId, Photo>();
  let albumStorage = Map.empty<AlbumId, Album>();

  var nextVideoId = 0;
  var nextPhotoId = 0;
  var nextAlbumId = 0;
  var nextContentPosition = 0;

  public type PhotoId = Nat;
  public type VideoId = Nat;
  public type AlbumId = Nat;

  public type PhotoUploadInput = {
    filename : Text;
    content : Storage.ExternalBlob;
  };

  public type VideoUploadInput = {
    filename : Text;
    content : Storage.ExternalBlob;
  };

  public type AlbumInput = {
    name : Text;
  };

  public type AlbumEntryInput = {
    isVideo : Bool;
    contentId : Nat;
    position : Nat;
  };

  public type AlbumEntry = {
    isVideo : Bool;
    contentId : Nat;
    position : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type DeleteAlbumResponse = {
    #success : Text;
    #error : Text;
    #permissionDenied : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllPhotos() : async [Photo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can view photos");
    };
    photoStorage.values().toArray().sort();
  };

  public shared ({ caller }) func uploadPhoto(photo : PhotoUploadInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can upload photos");
    };
    let newPhoto : Photo = {
      id = nextPhotoId;
      filename = photo.filename;
      uploadDate = Time.now();
      storageRef = photo.content;
      customOrder = photoStorage.size();
    };

    photoStorage.add(nextPhotoId, newPhoto);
    nextPhotoId += 1;
  };

  public query ({ caller }) func getAllVideos() : async [Video] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can view videos");
    };
    videoStorage.values().toArray().sort();
  };

  public shared ({ caller }) func uploadVideo(input : VideoUploadInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can upload videos");
    };

    // Determine MIME type based on file extension
    let mimeType = getMimeTypeFromFilename(input.filename);

    let newVideo : Video = {
      id = nextVideoId;
      filename = input.filename;
      uploadDate = Time.now();
      storageRef = input.content;
      customOrder = videoStorage.size();
      mimeType;
    };

    videoStorage.add(nextVideoId, newVideo);
    nextVideoId += 1;
  };

  let patternMp4 = #text ".mp4";
  let patternUpperMp4 = #text ".MP4";
  let patternMkv = #text ".mkv";
  let patternUpperMkv = #text ".MKV";
  let patternMov = #text ".mov";
  let patternUpperMov = #text ".MOV";
  let patternWebm = #text ".webm";
  let patternUpperWebm = #text ".WEBM";
  let patternAvi = #text ".avi";
  let patternUpperAvi = #text ".AVI";

  func getMimeTypeFromFilename(filename : Text) : Text {
    if (filename.endsWith(patternMp4) or filename.endsWith(patternUpperMp4)) {
      "video/mp4";
    } else if (filename.endsWith(patternMkv) or filename.endsWith(patternUpperMkv)) {
      "video/x-matroska";
    } else if (filename.endsWith(patternMov) or filename.endsWith(patternUpperMov)) {
      "video/quicktime";
    } else if (filename.endsWith(patternWebm) or filename.endsWith(patternUpperWebm)) {
      "video/webm";
    } else if (filename.endsWith(patternAvi) or filename.endsWith(patternUpperAvi)) {
      "video/x-msvideo";
    } else {
      "video/mp4"; // default
    };
  };

  public query ({ caller }) func getAllAlbums() : async [Album] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can view albums");
    };
    albumStorage.values().toArray().sort();
  };

  public shared ({ caller }) func createAlbum(albumInput : AlbumInput) : async AlbumId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can create albums");
    };
    let newAlbum : Album = {
      id = nextAlbumId;
      name = albumInput.name;
      contents = [];
    };

    albumStorage.add(nextAlbumId, newAlbum);
    nextAlbumId += 1;
    nextAlbumId - 1;
  };

  public shared ({ caller }) func addEntryToAlbum(albumId : AlbumId, entryInput : AlbumEntryInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can modify albums");
    };
    switch (albumStorage.get(albumId)) {
      case (null) {
        Runtime.trap("Album not found");
      };
      case (?album) {
        let newEntry : AlbumEntry = {
          isVideo = entryInput.isVideo;
          contentId = entryInput.contentId;
          position = album.contents.size();
        };

        let updatedContents = List.fromArray<AlbumContentEntry>(album.contents);
        updatedContents.add(newEntry);

        let updatedAlbum : Album = {
          id = album.id;
          name = album.name;
          contents = updatedContents.toArray();
        };

        albumStorage.add(albumId, updatedAlbum);
      };
    };
  };

  public shared ({ caller }) func movePhotoToAlbum(photoId : PhotoId, albumId : AlbumId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can modify albums");
    };

    let entryInput : AlbumEntryInput = {
      isVideo = false;
      contentId = photoId;
      position = 0;
    };

    await addEntryToAlbum(albumId, entryInput);
  };

  public shared ({ caller }) func deletePhoto(photoId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can delete photos");
    };
    photoStorage.remove(photoId);
  };

  public shared ({ caller }) func deleteVideo(videoId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can delete videos");
    };
    videoStorage.remove(videoId);
  };

  public shared ({ caller }) func deleteAlbum(albumId : Nat) : async DeleteAlbumResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #permissionDenied("Csak bejelentkezett családtag tud albumot törölni");
    };

    switch (albumStorage.get(albumId)) {
      case null {
        #error("A keresett album nem található");
      };
      case (?_) {
        albumStorage.remove(albumId);
        #success("Az album sikeresen törölve lett");
      };
    };
  };

  public shared ({ caller }) func rearrangePhotos(photoIds : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can rearrange photos");
    };
    let updatedPhotos = List.empty<Photo>();

    for ((index, photoId) in photoIds.enumerate()) {
      switch (photoStorage.get(photoId)) {
        case (null) {
          Runtime.trap("Photo not found");
        };
        case (?photo) {
          let newPhoto : Photo = {
            id = photo.id;
            filename = photo.filename;
            uploadDate = photo.uploadDate;
            storageRef = photo.storageRef;
            customOrder = index;
          };
          updatedPhotos.add(newPhoto);
        };
      };
    };

    photoStorage.clear();
    for (photo in updatedPhotos.values()) {
      photoStorage.add(photo.id, photo);
    };
  };

  public shared ({ caller }) func rearrangeVideos(videoIds : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only family members can rearrange videos");
    };
    let updatedVideos = List.empty<Video>();

    for ((index, videoId) in videoIds.enumerate()) {
      switch (videoStorage.get(videoId)) {
        case (null) {
          Runtime.trap("Video not found");
        };
        case (?video) {
          let newVideo : Video = {
            id = video.id;
            filename = video.filename;
            uploadDate = video.uploadDate;
            storageRef = video.storageRef;
            customOrder = index;
            mimeType = video.mimeType;
          };
          updatedVideos.add(newVideo);
        };
      };
    };

    videoStorage.clear();
    for (video in updatedVideos.values()) {
      videoStorage.add(video.id, video);
    };
  };
};
