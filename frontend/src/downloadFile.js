import api from "./api";

export async function downloadFile(attachment) {
  const res = await api.get(`/attachments/${attachment._id}`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.originalName || "document";
  a.click();
  URL.revokeObjectURL(url);
}
