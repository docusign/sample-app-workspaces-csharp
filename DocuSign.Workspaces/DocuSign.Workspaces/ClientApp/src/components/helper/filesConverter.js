async function fetchPublicFileAsBase64(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load file:${path}`);

  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const dataUrl = reader.result;
      const base64String = dataUrl.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function prepareDocuments(list) {
  const docs = [];

  for (const item of list) {
    const base64 = await fetchPublicFileAsBase64(item.path);
    docs.push({
      base64String: base64,
      name: item.name,
      isForSignature: true,
    });
  }

  return docs;
}
