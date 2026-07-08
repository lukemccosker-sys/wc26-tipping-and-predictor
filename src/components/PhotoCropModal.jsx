import React, { useState, useRef, useEffect, useCallback } from "react";

export default function PhotoCropModal({ file, onConfirm, onCancel }) {
  const [imgEl, setImgEl] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [crop, setCrop] = useState(null); // {x, y, size} in image pixel coords
  const [drag, setDrag] = useState(null); // {type: 'move'|'resize', startX, startY, startCrop}
  const containerRef = useRef(null);
  const [display, setDisplay] = useState({ w: 0, h: 0 });

  // Load the file into an Image element
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      // Initialize crop to a centered square = smaller dimension
      const size = Math.min(img.width, img.height);
      setCrop({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        size,
      });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Compute display dimensions once the container is laid out
  useEffect(() => {
    if (!imgEl || !containerRef.current) return;
    const compute = () => {
      const maxW = containerRef.current.clientWidth;
      const maxH = Math.min(window.innerHeight * 0.5, 380);
      const ratio = Math.min(maxW / imgEl.width, maxH / imgEl.height, 1);
      setDisplay({ w: imgEl.width * ratio, h: imgEl.height * ratio });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [imgEl]);

  const imgToScreen = useCallback((x, y) => {
    if (!imgEl || !display.w) return { x: 0, y: 0 };
    const scaleX = display.w / imgEl.width;
    const scaleY = display.h / imgEl.height;
    return { x: x * scaleX, y: y * scaleY };
  }, [imgEl, display]);

  const screenToImg = useCallback((x, y) => {
    if (!imgEl || !display.w) return { x: 0, y: 0 };
    const scaleX = imgEl.width / display.w;
    const scaleY = imgEl.height / display.h;
    return { x: x * scaleX, y: y * scaleY };
  }, [imgEl, display]);

  const onPointerDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!crop) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDrag({
      type,
      startX: clientX - rect.left,
      startY: clientY - rect.top,
      startCrop: { ...crop },
    });
  };

  const onPointerMove = (e) => {
    if (!drag || !imgEl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = screenToImg(clientX - rect.left - drag.startX, 0).x;
    const dy = screenToImg(0, clientY - rect.top - drag.startY).y;

    if (drag.type === "move") {
      const maxX = imgEl.width - drag.startCrop.size;
      const maxY = imgEl.height - drag.startCrop.size;
      setCrop({
        ...drag.startCrop,
        x: Math.max(0, Math.min(maxX, drag.startCrop.x + dx)),
        y: Math.max(0, Math.min(maxY, drag.startCrop.y + dy)),
      });
    } else if (drag.type === "resize") {
      const delta = Math.max(dx, dy);
      const maxSize = Math.min(imgEl.width - drag.startCrop.x, imgEl.height - drag.startCrop.y);
      const newSize = Math.max(40, Math.min(maxSize, drag.startCrop.size + delta));
      setCrop({ ...drag.startCrop, size: newSize });
    }
  };

  const onPointerUp = () => setDrag(null);

  const handleConfirm = async () => {
    if (!imgEl || !crop) return;
    const canvas = document.createElement("canvas");
    const outSize = 256;
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, crop.x, crop.y, crop.size, crop.size, 0, 0, outSize, outSize);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
      onConfirm(croppedFile);
    }, "image/jpeg", 0.9);
  };

  if (!imgUrl) return null;

  const cropScreen = crop && display.w ? imgToScreen(crop.x, crop.y) : null;
  const cropScreenSize = crop && display.w ? crop.size * (display.w / imgEl.width) : 0;

  return (
    <div className="modal" style={{ zIndex: 200 }} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onTouchEnd={onPointerUp}>
      <div className="modal-c" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, marginBottom: 4, textTransform: "uppercase" }}>Crop your photo</div>
        <div className="muted2" style={{ marginBottom: 14 }}>Drag to move • drag the corner to resize</div>

        <div
          ref={containerRef}
          style={{ position: "relative", display: "inline-block", touchAction: "none", borderRadius: 12, overflow: "hidden", maxWidth: "100%" }}
        >
          {imgUrl && <img src={imgUrl} style={{ display: "block", width: display.w || "auto", height: display.h || "auto", maxWidth: "100%" }} alt="crop" />}

          {/* Dark overlay outside crop area */}
          {cropScreen && (
            <>
              <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none", boxShadow: `0 0 0 9999px rgba(0,0,0,.55)`, clipPath: `polygon(0 0, 0 100%, ${cropScreen.x}px 100%, ${cropScreen.x}px ${cropScreen.y}px, ${cropScreen.x + cropScreenSize}px ${cropScreen.y}px, ${cropScreen.x + cropScreenSize}px ${cropScreen.y + cropScreenSize}px, ${cropScreen.x}px ${cropScreen.y + cropScreenSize}px, ${cropScreen.x}px 100%, 100% 100%, 100% 0)` }} />
              {/* Crop frame */}
              <div
                onPointerDown={(e) => onPointerDown(e, "move")}
                style={{
                  position: "absolute",
                  left: cropScreen.x,
                  top: cropScreen.y,
                  width: cropScreenSize,
                  height: cropScreenSize,
                  border: "2px solid #fff",
                  cursor: "move",
                  boxSizing: "border-box",
                  touchAction: "none",
                }}
              >
                {/* Grid lines */}
                <div style={{ position: "absolute", left: "33.3%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,.4)" }} />
                <div style={{ position: "absolute", left: "66.6%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,.4)" }} />
                <div style={{ position: "absolute", top: "33.3%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,.4)" }} />
                <div style={{ position: "absolute", top: "66.6%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,.4)" }} />
                {/* Resize handle */}
                <div
                  onPointerDown={(e) => onPointerDown(e, "resize")}
                  style={{
                    position: "absolute",
                    right: -8,
                    bottom: -8,
                    width: 20,
                    height: 20,
                    background: "#fff",
                    borderRadius: "50%",
                    border: "2px solid #7b54f0",
                    cursor: "nwse-resize",
                    touchAction: "none",
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={{ flex: 1, background: "#fff", border: "2px solid #e0d2bd", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", color: "#6c7384" }}>
            Cancel
          </button>
          <button onClick={handleConfirm} style={{ flex: 1, background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
            ✓ Use photo
          </button>
        </div>
      </div>
    </div>
  );
}