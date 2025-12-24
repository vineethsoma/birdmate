import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * React application with router configuration
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
// Placeholder components (to be implemented in user stories)
function HomePage() {
    return (_jsxs("div", { style: { padding: '2rem', fontFamily: 'system-ui' }, children: [_jsx("h1", { children: "\uD83D\uDC26 Birdmate" }), _jsx("p", { children: "Natural Language Bird Search" }), _jsx("p", { style: { color: '#666' }, children: "Foundation phase complete. Search interface coming soon." })] }));
}
function BirdDetailPage() {
    return (_jsxs("div", { style: { padding: '2rem', fontFamily: 'system-ui' }, children: [_jsx("h1", { children: "Bird Details" }), _jsx("p", { style: { color: '#666' }, children: "Bird detail page coming soon." })] }));
}
function NotFoundPage() {
    return (_jsxs("div", { style: { padding: '2rem', fontFamily: 'system-ui' }, children: [_jsx("h1", { children: "404 - Page Not Found" }), _jsx("p", { children: "The page you're looking for doesn't exist." })] }));
}
/**
 * Main application component
 */
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/birds/:id", element: _jsx(BirdDetailPage, {}) }), _jsx(Route, { path: "/404", element: _jsx(NotFoundPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/404", replace: true }) })] }) }) }));
}
export default App;
