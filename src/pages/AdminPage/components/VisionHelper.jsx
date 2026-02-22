import React, { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_VISION_API_URL || "http://localhost:8000";

export default function VisionHelper() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [question, setQuestion] = useState("ไอคอนในรูปคืออะไร ใช้ทำอะไร และใช้งานยังไง");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) return setPreviewUrl("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Ctrl+V วางรูป
  useEffect(() => {
    if (!open) return;
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      for (const it of items) {
        if (it.type?.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) setFile(f);
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open]);

  const submit = async () => {
    setError("");
    setResult("");
    if (!file) return setError("ยังไม่ได้ใส่รูปเลย");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("question", question);

      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/vision/explain`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data?.text || "");
    } catch (e) {
      setError(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult("");
    setError("");
  };

  return (
    <>
      <button className="vision-icon-btn" title="AI อธิบายจากรูป" onClick={() => setOpen(true)} type="button">
        🧠
      </button>

      {open && (
        <div className="vision-modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div className="vision-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="vision-modal-header">
              <div className="vision-modal-title">AI อธิบายไอคอนจากรูป</div>
              <button className="vision-close-btn" onClick={() => setOpen(false)} type="button">✕</button>
            </div>

            <div className="vision-modal-body">
              <div
                className="vision-dropzone"
                onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] || null); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                {!previewUrl ? (
                  <div className="vision-dropzone-text">
                    <div style={{ marginBottom: 8 }}>ลากรูปมาวาง / คลิกเพื่อเลือกไฟล์</div>
                    <div className="vision-hint">หรือกด Ctrl+V เพื่อวางรูป</div>
                  </div>
                ) : (
                  <img className="vision-preview" src={previewUrl} alt="preview" />
                )}
              </div>

              <div className="vision-form">
                <label className="vision-label">คำถาม</label>
                <input className="vision-input" value={question} onChange={(e) => setQuestion(e.target.value)} />

                <div className="vision-actions">
                  <button className="tab-btn" type="button" onClick={reset} disabled={loading}>♻️ ล้าง</button>
                  <button className="tab-btn active" type="button" onClick={submit} disabled={loading}>
                    {loading ? "⏳ กำลังวิเคราะห์..." : "✨ ส่งให้ AI"}
                  </button>
                </div>

                {error && <div className="vision-error">{error}</div>}
                {result && <div className="vision-result"><pre className="vision-pre">{result}</pre></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
