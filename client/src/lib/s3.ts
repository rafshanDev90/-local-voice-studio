export async function getPresignedUrl({ key }: { key: string }): Promise<string> {
  return `/audio/${key}`;
}

export async function getUploadUrl(fileType: string): Promise<{ uploadUrl: string; s3Key: string }> {
  return { uploadUrl: "", s3Key: `uploads/${Date.now()}` };
}
