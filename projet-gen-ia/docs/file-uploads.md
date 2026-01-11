# File Upload System with Local Storage

This document explains how the application handles file uploads using local server storage.

## Architecture Overview

The file upload system uses a server-based approach:

1. **Upload Phase**: Client uploads files directly to the server's local storage
2. **Access Phase**: Client requests files from the server

This approach provides several benefits:

- Files are stored locally on the server where the backend operates
- No external dependencies or cloud storage costs
- Simple and straightforward implementation
- Server maintains full control over access permissions
- Suitable for development and small to medium deployments

## Key Components

### 1. Local Storage Client (`src/utils/storage/local.ts`)

The `LocalStorage` class implements the `IStorage` interface and provides:

- **Upload Methods**: Direct upload to server filesystem
- **Download Methods**: File streaming with range support for video
- **Management**: File existence checks and deletion
- **Configuration**: Stores files in a local `./uploads` directory

```typescript
class LocalStorage implements IStorage {
  // Upload file to local storage
  async upload(
    key: string,
    data: Buffer,
    contentType: string
  ): Promise<void>;

  // Get local URL for file access
  async getPresignedUrl(key: string): Promise<string>;
  
  // Stream file with range support
  async getStream(key: string, rangeHeader: string | null): Promise<StreamFileResponse>;
}
```

### 2. Server API Route (`src/routes/api/uploads/$.ts`)

Handles file serving and upload:

- **GET**: Serves files from local storage with streaming support
- **PUT**: Accepts file uploads and stores them locally
- Supports HTTP range requests for video streaming
- Proper content-type handling

### 3. Server Functions

#### Media Upload Functions (`src/fn/attachments.ts`)

- `getMediaUploadUrlFn`: Creates upload URL for media files
  - Generates unique attachment ID and structured storage path: `attachments/{userId}/{attachmentId}.{ext}`
  - Requires authentication
  - Returns server URL for upload

#### Download Functions

- `getAttachmentUrlFn`: Returns server URL for file access
- `getMultipleAttachmentUrlsFn`: Returns multiple file URLs

#### Generic Storage Functions (`src/fn/storage.ts`)

- `getProfileImageUploadUrlFn`: Profile image uploads (`profile-images/{userId}/{timestamp}.{ext}`)
- `getModuleContentUploadUrlFn`: Module content uploads
- `getImageUrlFn`: Generic image access

### 4. Client-Side Upload Logic (`src/utils/storage/media-helpers.ts`)

The client handles the actual upload process:

```typescript
export async function uploadMediaFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<MediaUploadResult>;
```

**Upload Process:**

1. Request upload URL from server
2. Upload file directly to server using XMLHttpRequest (for progress tracking)
3. Server stores file in local filesystem
4. Return metadata including storage key

### 5. File Upload UI (`src/components/ui/file-upload.tsx`)

Provides drag-and-drop interface with:

- File type validation
- Size limits (configurable)
- Progress indication
- Error handling
- Preview for image files

## Storage Structure

Files are organized in the local filesystem with the following structure:

```
uploads/
├── attachments/
│   └── {userId}/
│       └── {attachmentId}.{ext}
├── profile-images/
│   └── {userId}/
│       └── {timestamp}.{ext}
└── modules/
    └── {userId}/
        └── {timestamp}.{ext}
```

## File Access

Files are accessed through the `/api/uploads/*` route:

- Example: `/api/uploads/attachments/user123/abc123.jpg`
- Supports HTTP range requests for video streaming
- Proper cache headers for performance
- Authentication can be added if needed

## How It Works: Upload Flow

1. **User selects file** in upload UI
2. **Client requests upload URL** from server function
3. **Server generates upload URL** and returns with metadata
4. **Client uploads to server** using the URL with progress tracking
5. **Server stores file** in local filesystem
6. **Client saves metadata** to database via separate API call

## How It Works: Download Flow

1. **Client needs to access file** (e.g., display image, play video)
2. **Client requests presigned download URL** from server function with storage key
3. **Server generates presigned URL** for the specific file
2. **Client requests file URL** from server
3. **Server returns local URL** (e.g., `/api/uploads/attachments/...`)
4. **Client uses URL** to fetch/stream the file from the server

## Configuration

No external configuration needed. The upload directory defaults to `./uploads` relative to the server process.

## Deployment Considerations

- Ensure the server has sufficient disk space
- Consider backup strategy for uploaded files
- For production, consider:
  - Volume mounting in Docker/Kubernetes
  - Regular backups
  - Monitoring disk usage
  - CDN for better performance (optional)

## Migration from R2/S3

This system replaces the previous R2/S3 implementation with local storage. No cloud credentials are needed.
