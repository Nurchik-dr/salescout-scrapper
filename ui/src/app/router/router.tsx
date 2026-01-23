import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from '../../pages/authorization/login/loginPage';
import MainPage from '../../pages/main/mainPage';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Header from '../../shared/ui/header/header';
import RegistrationPage from '../../pages/authorization/registration/registrationPage';
import VerificationPage from '../../pages/authorization/verification/verificationPage';
import SetPasswordPage from '../../pages/authorization/setPassword/setPasswordPage';
import Loading from '../../shared/ui/loading/loading';
import CompanyPage from '../../pages/company/companyPage';
import NotFoundPage from '../../pages/notFound/notFoundPage';

export const Router = () => {
  const location = useLocation();
  const noHeaderPaths = ['/login', '/registration', '/verification', '/set-password', '/404'];
  const { loading } = useSelector((state: RootState) => state.user);

  const shouldDisplayHeader = !noHeaderPaths.includes(location.pathname);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      {shouldDisplayHeader && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <CompanyPage />

            </PrivateRoute>
          }
        />

        <Route
          path="/recomendation/:id"
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

const PrivateRoute = ({ children }: any) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
