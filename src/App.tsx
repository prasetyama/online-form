import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthGuard } from './components/organisms/AuthGuard';
import { MainLayout } from './components/organisms/MainLayout';
import { PRNonTradeListPage } from './pages/PRNonTradeListPage';
import { PRNonTradeFormPage } from './pages/PRNonTradeFormPage';
import { PRDetailPage } from './pages/PRDetailPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <AuthGuard>
                        <MainLayout />
                    </AuthGuard>
                }
            >
                {/* List View */}
                <Route index element={<PRNonTradeListPage />} />
                <Route path="pr-non-trade" element={<Navigate to="/" replace />} />

                {/* Create Form */}
                <Route path="create" element={<PRNonTradeFormPage />} />
                <Route path="pr-non-trade/create" element={<PRNonTradeFormPage />} />
                <Route path="pr/create" element={<PRNonTradeFormPage />} />

                {/* Edit Form */}
                <Route path=":id/edit" element={<PRNonTradeFormPage />} />
                <Route path="pr-non-trade/:id/edit" element={<PRNonTradeFormPage />} />
                <Route path="pr/:id/edit" element={<PRNonTradeFormPage />} />

                {/* Detail View */}
                <Route path="detail/:id" element={<PRDetailPage />} />
                <Route path="pr-non-trade/:id" element={<PRDetailPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ToastProvider>
    );
}
