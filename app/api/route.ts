const LONG_PARAGRAPH = `
In the ever-evolving landscape of modern web development, developers face numerous challenges 
when building scalable and performant applications. One of the most critical aspects is managing 
network calls efficiently, especially in frameworks like Next.js that support both server-side and 
client-side rendering. The ability to persist network calls and handle data fetching strategies 
becomes paramount when creating seamless user experiences. Developers must consider various factors 
such as caching mechanisms, error handling, loading states, and data synchronization across different 
components. Next.js provides powerful tools and patterns to address these concerns, including API routes, 
server components, and built-in data fetching methods. Understanding how to leverage these features 
effectively can significantly improve application performance and user satisfaction. The framework's 
flexibility allows developers to choose between static generation, server-side rendering, or client-side 
fetching based on specific use cases. Additionally, implementing proper error boundaries and fallback 
mechanisms ensures that applications remain robust and reliable even when network conditions are less than ideal. 
By mastering these concepts and techniques, developers can build sophisticated applications that handle 
network operations gracefully while maintaining optimal performance and providing excellent user experiences 
across various devices and network conditions.
`;

type StreamController = ReadableStreamDefaultController;

let clients: StreamController[] = [];
let isProducing = false;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const formatSSE = (char: string) => `data: ${char}\n\n`;

const addClient = (controller: StreamController) => {
  clients.push(controller);
};

const removeClient = (controller: StreamController) => {
  clients = clients.filter((c) => c !== controller);
};

const broadcast = (msg: string) => {
  for (const client of clients) {
    client.enqueue(msg);
  }
};

const closeAllClients = () => {
  for (const client of clients) {
    client.close();
  }
  clients = [];
};

const runProducer = async () => {
  const chars = LONG_PARAGRAPH.split("");

  for (let i = 0; i < chars.length; i++) {
    broadcast(formatSSE(chars[i]));
    await sleep(100);
  }

  closeAllClients();
  isProducing = false;
};

const startProducer = () => {
  if (isProducing) return;
  isProducing = true;
  runProducer();
};

const createStream = () => {
  let localController: StreamController;

  return new ReadableStream({
    start(controller) {
      localController = controller;
      addClient(controller);
    },
    cancel() {
      if (localController) {
        removeClient(localController);
      }
    },
  });
};

export const GET = () => {
  startProducer();

  const stream = createStream();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
