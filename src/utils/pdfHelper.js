/**
 * Captures an HTML element and downloads it as an A4 formatted PDF.
 * @param {string} elementId - The ID of the HTML element to capture.
 * @param {string} filename - The name of the downloaded PDF file.
 */
export const downloadHTMLAsPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Element not found");

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};
