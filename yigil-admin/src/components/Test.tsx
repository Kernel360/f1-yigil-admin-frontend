import React, { useEffect } from "react";
import Layout from "./Layout.tsx";
import { EventSourcePolyfill, NativeEventSource } from "event-source-polyfill";

const TestPage: React.FC = () => {
  const EventSource = EventSourcePolyfill || NativeEventSource;

  useEffect(() => {
    let eventSource: EventSource;
    const fetchSse = async () => {
      try {
        eventSource = new EventSource(
          "http://localhost:8080/api/v1/notifications/stream"
        );

        eventSource.addEventListener("notification", (e) => {
          const res = e.data;
          console.log(res);
        });

        eventSource.onmessage = async (event) => {
          const res = await event.data;
          console.log(res);
        };

        eventSource.onerror = async () => {
          console.log("error occured");
        };
      } catch (error) {
        console.error(error);
      }
    };
    fetchSse();
    return () => eventSource.close();
  });
  return (
    <Layout>
      <span>하이</span>
    </Layout>
  );
};

export default TestPage;
