import React, { useState } from "react";

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [preview, setPreview] = useState("");

  // handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // send file to backend
  const handleUpload = async () => {
    if (!file) return alert("Please select an image!");

    const formData = new FormData();
    formData.append("file", file); // name must match multer.single("file")
    formData.append("userId", "123456"); // optional, can leave blank

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.description);
      } else {
        setResponse(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setResponse("❌ Error uploading image");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Upload Image & Analyze</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div className="mt-4">
          <p className="font-semibold">Preview:</p>
          <img src={preview} alt="preview" className="w-48 border rounded mt-2" />
        </div>
      )}

      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload & Send
      </button>

      {response && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h3 className="font-semibold mb-2">Gemini Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
