import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";

function LiveSite() {
  const { id } = useParams();

  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/website/get-by-slug/${id}`, {
          withCredentials: true,
        });
        setHtml(result.data.latestCode || "");
      } catch (err) {
        console.log(err);
        setError("Site not found");
      } finally {
        setLoading(false);
      }
    };

    handleGetWebsite();
  }, [id]);

  if (error) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-[#071217] px-6 text-center text-white">
        <h1 className="font-display text-4xl font-bold">{error}</h1>
        <p className="mt-3 max-w-sm text-sm text-[#8AA2A8]">
          This link may be wrong, or the site hasn't been published yet.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#071217]" role="status" aria-label="Loading site">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1D343D] border-t-[#3EE8C0]" />
      </div>
    );
  }

  return (
    <iframe
      title="Live Site"
      srcDoc={html}
      sandbox="allow-scripts allow-forms"
      style={{ width: "100%", height: "100dvh", border: "none", display: "block" }}
    />
  );
}

export default LiveSite;