"use client";

import React, { useEffect } from "react";

export default function Home() {
  const [streams, setStreams] = React.useState("");

  const eventSource = React.useRef<EventSource | null>(null);

  const getStreams = React.useCallback(async () => {
    try {
      const event = eventSource.current || new EventSource("/api", {});

      event.onmessage = (event) => {
        setStreams((prev) => prev + event.data);
      };

      eventSource.current = event;
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getStreams();
  }, [getStreams]);

  return (
    <div className="flex flex-col h-screen py-8 w-9/11 mx-auto">
      <div className="flex-1 min-h-0">{streams}</div>
      <button
        className="block w-full border border-neutral-700 bg-neutral-800 text-white h-15 rounded-sm"
        onClick={getStreams}
      >
        Get Streams
      </button>
    </div>
  );
}
