"use client";

import { useState, useEffect, useRef } from "react";

interface ImageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function ImageSelector({ value, onChange, label = "Select Image" }: ImageSelectorProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = () => {
    setLoading(true);
    fetch("/api/admin/images")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch images", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
        fetchImages();
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const filteredImages = images.filter((img) =>
    img.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image path or URL..."
            className="block w-full p-2 pr-10 rounded bg-gray-600 text-white border border-gray-500 text-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded transition flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          )}
          {uploading ? "..." : "Upload"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 p-4 bg-gray-800 border border-white/10 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50 max-h-[400px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-500 text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xs uppercase font-bold"
            >
              Close
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">Loading gallery...</div>
          ) : (
            <div className="overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2 pr-2 custom-scrollbar">
              {filteredImages.length === 0 ? (
                <div className="col-span-full py-10 text-center text-gray-500 text-sm">No images found</div>
              ) : (
                filteredImages.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => {
                      onChange(img);
                      setIsOpen(false);
                    }}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition ${
                      value === img ? "border-primary" : "border-transparent hover:border-white/30"
                    }`}
                    title={img}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
