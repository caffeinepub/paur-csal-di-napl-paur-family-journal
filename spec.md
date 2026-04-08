# Paur Családi Napló (Paur Family Journal)

## Overview
A closed-access Hungarian-language family website for sharing and managing photos, videos, family recipes, and albums. The application provides a private space for family members to upload, organize, and view multimedia content with a heritage-inspired, nature-themed design.

## Core Features

### Homepage
- Display the Paur heritage-style logo
- Show a beautiful, realistic tree image as the central visual element
- Four main navigation buttons: "Fotók (Photos)", "Videók (Videos)", "Receptek (Recipes)", and "Albumok (Albums)"
- All interface elements and content in Hungarian language
- Heritage-inspired, nature-themed design throughout

### Photos Section (Fotók)
- Upload and display photos with proper blob URL handling
- **Photo upload button must correctly trigger file selection dialog and handle file processing**
- **Selected photo files must be properly converted to ExternalBlob format before sending to backend's `uploadPhoto` endpoint**
- **Upload process must include visible loading feedback (spinner, disabled button, or progress indicator) during file processing**
- **Display Hungarian-language success messages ("Fotó sikeresen feltöltve!") or error messages ("Hiba történt a fotó feltöltése során") after upload completion**
- **Uploaded photos must automatically appear in the gallery immediately after successful upload without requiring manual page reload**
- **Backend calls must send the blob reference properly and reflect updated state immediately in the photo gallery**
- Rearrange photos by drag-and-drop or ordering controls
- Delete individual photos
- View photos in gallery format
- **Lightbox photo viewing**: Click on photo thumbnails to open in overlay modal with darkened background
- **Photo navigation**: Include left/right navigation arrows to browse between photos in lightbox
- **Lightbox controls**: Close button (✕) with Hungarian label "Bezárás"
- **Smooth animations**: Fade/zoom-in animation when opening lightbox with heritage-style design
- Edit photo descriptions or metadata
- Comment on photos
- Rate photos

### Videos Section (Videók)
- Upload and display videos with reliable playback functionality
- **Video upload button must correctly trigger file selection dialog and handle file processing**
- **Selected video files must be properly converted to ExternalBlob format before sending to backend's `uploadVideo` endpoint**
- **Upload process must include visible loading feedback (spinner, disabled button, or progress indicator) during file processing**
- **Display Hungarian-language success messages ("Videó sikeresen feltöltve!") or error messages ("Hiba történt a videó feltöltése során") after upload completion**
- **Uploaded videos must automatically appear in the gallery immediately after successful upload without requiring manual page reload**
- **Backend calls must send the blob reference properly and reflect updated state immediately in the video gallery**
- Backend must provide public URLs or proper blob access for video streaming
- Frontend must fetch actual public links from blob storage using storageRef
- Videos must be playable directly within the interface using HTML5 `<video controls>` tags with proper source URLs
- Implement MIME-type detection for common video formats (MP4, MOV, MKV, WebM)
- Include appropriate MIME type attributes in `<source>` tags for browser compatibility
- Add fallback error handling with Hungarian error messages when videos cannot be played
- Videos must stream directly in the browser without playback errors across different formats
- Rearrange videos by drag-and-drop or ordering controls
- Delete individual videos with immediate UI updates after backend deletion
- Edit video descriptions or metadata
- Comment on videos
- Rate videos

### Recipes Section (Receptek)
- Create and manage family recipes
- Upload photos of dishes
- Edit recipe content including ingredients and instructions
- Delete recipes
- Comment on recipes with family feedback
- Rate recipes with detailed rating system
- Search and filter recipes by ingredients or categories
- Share recipes within the family

### Albums Section (Albumok)
- Create new albums with names and descriptions
- View all existing albums in organized layout
- Delete albums with confirmation
- Reorder albums by drag-and-drop or ordering controls
- Edit album details including names and descriptions
- Full CRUD operations for album management
- Hungarian-language interface for all album operations

## Authentication & Authorization
- Internet Identity login integration
- User role-based access with "#user" role permissions
- Proper authorization refresh after login to prevent "Unauthorized" errors
- Ensure users with "#user" role can upload files without permission errors
- Private, invite-only family space access control

## Backend Data Storage
- Store uploaded photos and videos with proper blob URL handling
- Provide `uploadPhoto` endpoint that accepts photo files and returns proper response
- Provide `uploadVideo` endpoint that accepts video files and returns proper response
- Both upload endpoints must handle file processing, blob creation, and storage
- Provide public URL access or proper blob retrieval methods for video playback
- Maintain photo and video metadata (upload date, filename, order, MIME type)
- Store recipe data including ingredients, instructions, and photos
- Store album data including names, descriptions, creation dates, and ordering
- Store comments and ratings for all content types
- Track content ordering for rearrangement functionality
- Handle storage references with appropriate permissions for "#user" role
- Ensure video storage allows frontend to retrieve playable URLs for HTML5 video elements

## Upload Functionality
- **Photo upload button must correctly trigger file selection, properly convert files to ExternalBlob, and successfully call the `uploadPhoto` endpoint**
- **Video upload button must correctly trigger file selection, properly convert files to ExternalBlob, and successfully call the `uploadVideo` endpoint**
- **Both upload processes must include visible loading feedback (spinner, disabled state, or progress indicator) while processing files**
- **Display Hungarian-language success messages ("Sikeresen feltöltve!") upon successful upload**
- **Display Hungarian-language error messages ("Feltöltési hiba történt!") when upload fails**
- **Uploaded content must automatically refresh and appear in the respective galleries immediately after successful upload without manual page reload**
- **Backend calls must properly send blob references and immediately reflect updated state in the UI**
- Reliable photo and video upload with proper blob URL transmission
- Detect and store MIME types for uploaded video files
- Correct handling of file permissions and storage references
- Error-free upload process for authorized users
- Proper frontend-to-backend ExternalBlob conversion and transmission

## Video Playback Requirements
- VideosSection component must convert storageRef to actual playable URLs
- Backend must provide method to retrieve public URLs from blob storage
- Generated URLs must be compatible with HTML5 video elements as src attributes
- Videos must render with `<video controls>` tags and play without errors
- Support multiple video formats (MP4, MOV, MKV, WebM) with proper MIME type detection
- Include MIME type attributes in video source tags for optimal browser compatibility
- Display Hungarian error messages for video loading failures
- Ensure proper streaming functionality for all uploaded video formats
- Frontend must handle URL conversion correctly for reliable video playback

## User Interface Language
- All text, labels, buttons, and messages in Hungarian
- Hungarian terminology throughout the application
- Hungarian error messages for video playback failures
- **Hungarian success and error messages for all upload operations ("Sikeresen feltöltve!", "Feltöltési hiba történt!")**
- Hungarian-language alerts for unauthorized actions
- **Hungarian progress feedback during upload processes ("Feltöltés folyamatban...")**
- Hungarian labels for lightbox controls ("Bezárás" for close button)
- Hungarian interface for Albums section including all CRUD operations

## Design Theme
- Heritage-inspired, nature-themed design throughout the application
- Consistent visual styling that reflects family heritage values
- Natural color palette and typography choices
- Cohesive design elements across all sections
- **Maintain current heritage-inspired visual design for upload buttons with proper loading states and feedback messages**
- **Upload buttons must show visual feedback (loading spinner, disabled state, or progress indicator) during file processing**
- **Lightbox styling**: Heritage-style design for photo overlay modal with natural, elegant appearance
- **Smooth transitions**: Fade and zoom animations consistent with heritage aesthetic
- Albums section maintains consistent heritage-inspired design with other sections
- **Preserve existing Hungarian text and heritage-style design across the entire application**
