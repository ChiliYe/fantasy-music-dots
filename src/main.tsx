/** @format */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CanvasTest from "./pages/canvasTest";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<CanvasTest />
	</StrictMode>,
);
