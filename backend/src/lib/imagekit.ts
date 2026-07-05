import ImageKit from "@imagekit/nodejs";
import { NotFoundError } from "@imagekit/nodejs";

export async function deleteImageFromImagekit(imagekitFileId: string) {
    try {
        if (!imagekitFileId) return

        const client = new ImageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        })

        await client.files.delete(imagekitFileId);
    } catch (error) {
        if (error instanceof NotFoundError) return
        throw error
    }
}