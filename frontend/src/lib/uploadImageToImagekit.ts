import { fetchApi } from "./fetchApi"
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from "@imagekit/react"

export async function uploadImageToImagekit(file: File, getToken: () => Promise<string | null>, opts: {}) {
  try {
    const { fileName }: { fileName?: string } = opts
    const auth = await fetchApi('/admin/get-imagekit-auth-parameters', {
      getToken
    })

    const safeFileName = fileName ?? (file.name.replace(/[^\w.-]/g, "_").slice(0, 200) || `upload-${Date.now()}.jpg`);

    const response = await upload({
      file,
      fileName: safeFileName,
      token: auth.token,
      signature: auth.signature,
      expire: auth.expire,
      publicKey: auth.publicKey
    })
    console.log("Upload response:", response);

    return {
      url: response.url,
      fileId: response.fileId
    }

  } catch (error) {
    if (error instanceof ImageKitAbortError) {
      console.error("Upload aborted:", error.reason);
    } else if (error instanceof ImageKitInvalidRequestError) {
      console.error("Invalid request:", error.message);
    } else if (error instanceof ImageKitUploadNetworkError) {
      console.error("Network error:", error.message);
    } else if (error instanceof ImageKitServerError) {
      console.error("Server error:", error.message);
    } else {
      // Handle any other errors that may occur.
      console.error("Upload error:", error);
    }
    throw error
  }
}