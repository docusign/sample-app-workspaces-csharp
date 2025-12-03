function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchPublicFileAsBase64(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load file:${path}`);

  const blob = await res.blob();

  return fileToBase64(blob);
}

export async function prepareDocuments(list) {
  const docs = [];
  for (const item of list) {
    let base64;
    if (item.file instanceof File || item.file instanceof Blob) {
      base64 = await fileToBase64(item.file);
    } else if (item.path) {
      base64 = await fetchPublicFileAsBase64(item.path);
    } else {
      throw new Error('No valid file or path provided in prepareDocuments()');
    }

    docs.push({
      base64String: base64,
      name: item.name,
      isForSignature: item.isForSignature,
    });
  }

  return docs;
}
