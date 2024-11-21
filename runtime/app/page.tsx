"use client";

import React, { useEffect } from "react";

export default function Home() {
  /*useEffect(() => {
    (async () => {
      const response = await fetch(
        "http://localhost:3000/api/run-config/98c5a8f5-943e-48be-8605-552c32c3c2d0"
      );
      const data = await response.json();
      console.log(data);
    })();
  }, []);*/

  return (
    <>
      <b>Hello from Next.js!</b>
      <button
        onClick={async () => {
          const response = await fetch(
            process.env.NEXT_PUBLIC_SYNTHETICLOOM_URL +
              "/api/run-config/98c5a8f5-943e-48be-8605-552c32c3c2d0",
            {
              headers: {
                "ngrok-skip-browser-warning": "1",
              },
            }
          );
          const data = await response.text();
          console.log(data);
        }}
      >
        Click me
      </button>
    </>
  );
}
