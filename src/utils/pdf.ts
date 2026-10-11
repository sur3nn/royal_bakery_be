const API = "https://indigo-kangaroo-864288.hostingersite.com"; // import.meta.env.VITE_API_URL

const getPdfBlob = async (path: string): Promise<Blob> => {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('PDF request failed');
  return res.blob();
};

// Saves the PDF to the device
export const downloadPdf = async (path: string, filename: string) => {
  try {
    const blob = await getPdfBlob(path);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    alert('Could not download the PDF. Please try again.');
  }
};

// Opens the PDF in a new tab (the "view")
export const viewPdf = async (path: string) => {
  const win = window.open('', '_blank'); // open first so the popup is not blocked
  try {
    const blob = await getPdfBlob(path);
    const url = URL.createObjectURL(blob);

    if (win) win.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    win?.close();
    alert('Could not open the PDF. Please try again.');
  }
};