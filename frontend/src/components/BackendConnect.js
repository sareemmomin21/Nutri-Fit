import React from "react";
import { useEffect, useState } from "react";

export default function BackendConnect() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div>
      <p>Backend message:</p>
      <p>{message}</p>
    </div>
  );
}
