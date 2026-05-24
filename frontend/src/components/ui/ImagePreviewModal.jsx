import { useState } from 'react';
import { FaTimes, FaDownload, FaShare, FaWhatsapp } from 'react-icons/fa'; // ← Fixed here

const ImagePreviewModal = ({ isOpen, onClose, imageUrl, altText = "Preview" }) => {
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = altText.replace(/\s+/g, '_') + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: altText,
        url: imageUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(imageUrl);
      alert('Image link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">{altText}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Image */}
        <div className="relative bg-slate-950 p-4 flex items-center justify-center min-h-[400px]">
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-[70vh] max-w-full object-contain rounded-2xl"
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-3 rounded-2xl font-medium transition"
          >
            <FaDownload /> Download
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-3 rounded-2xl font-medium transition"
          >
            <FaShare /> Share
          </button>

          {/* Optional: WhatsApp Share */}
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(imageUrl)}`, '_blank')}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-2xl font-medium transition"
          >
            <FaWhatsapp />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;