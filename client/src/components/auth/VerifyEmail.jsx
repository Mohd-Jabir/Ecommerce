import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { verifyEmail } from "../../api/auth.api.js";
import Button from "../common/Button.jsx";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        const response = await verifyEmail({
          token,
        });

        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Unable to verify email.",
        );
      }
    }

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B4A]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <div
        className={`rounded-xl p-4 text-sm ${
          status === "success"
            ? "bg-green-50 text-green-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        {message}
      </div>

      <Link to="/login">
        <Button>
          Continue to login
        </Button>
      </Link>
    </div>
  );
}