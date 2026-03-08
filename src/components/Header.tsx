import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/waste-institute-logo-new-paths.svg';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="WasteInstitute" className="h-12" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Courses
            </Link>
            <Link
              to="/news"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              News
            </Link>
            <Link
              to="/resources"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Resources
            </Link>
            <Link
              to="/faq"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              FAQ
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/courses"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Courses
              </Link>
              <Link
                to="/news"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                News
              </Link>
              <Link
                to="/resources"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Resources
              </Link>
              <Link
                to="/faq"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                FAQ
              </Link>
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Contact
              </Link>

              {/* Mobile Auth Links */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                {loading ? (
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                ) : user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
