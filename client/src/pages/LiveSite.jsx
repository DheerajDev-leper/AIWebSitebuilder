import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function LiveSite() {
  const { id } = useParams();

  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/get-by-slug/${id}`,
          {
            withCredentials: true,
          }
        );

        setHtml(result.data.latestCode || "");
      } catch (err) {
        console.log(err);
        setError("Site not found");
      }
    };

    handleGetWebsite();
  }, [id]);

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <iframe
      title="Live Site"
      srcDoc={html}
      sandbox="allow-scripts allow-forms"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}

export default LiveSite;