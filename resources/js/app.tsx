import "./bootstrap";
import { createInertiaApp } from "@inertiajs/react";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";

createInertiaApp({
    progress: {
        color: "#f59e42",
        includeCSS: true,
        showSpinner: true,
    },
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.tsx");
        return pages[`./Pages/${name}.tsx`]();
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <Suspense fallback={<div>🔃 Load App</div>}>
                <App {...props} />
            </Suspense>
        );
    },
});
