import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {AtmosphericDataProvider} from "@/contexts/AtmosphericDataContext.tsx";

createRoot(document.getElementById("root")!).render(
    <AtmosphericDataProvider>
        <App />
    </AtmosphericDataProvider>
);
