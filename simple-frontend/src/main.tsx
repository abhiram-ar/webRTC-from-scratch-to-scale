import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Sender from "./pages/Sender.tsx";
import Reciver from "./pages/Reciver.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { path: "/sender", Component: Sender },
      { path: "/reciver", Component: Reciver },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
