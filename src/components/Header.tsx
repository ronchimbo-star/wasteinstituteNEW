import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/waste-institute-logo-new-paths.svg';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-colors font-medium ${
    isActive
      ? 'text-emerald-600 border-b-2 border-emerald-600 pb-0.5'
      : 'text-gray-700 hover:text-emerald-600'
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-colors font-medium ${
    isActive ? 'text-emerald-600 font-semibold' : 'text-gray-700 hover:text-emerald-600'
  }`;

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
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
            <NavLink to="/news" className={navLinkClass}>News</NavLink>
            <NavLink to="/events" className={navLinkClass}>Events</NavLink>
            <NavLink to="/resources" className={navLinkClass}>Resources</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
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
            <nav className="flex flex-col space-y-4" aria-label="Mobile navigation">
              <NavLink to="/" end onClick={closeMobileMenu} className={mobileNavLinkClass}>Home</NavLink>
              <NavLink to="/courses" onClick={closeMobileMenu} className={mobileNavLinkClass}>Courses</NavLink>
              <NavLink to="/news" onClick={closeMobileMenu} className={mobileNavLinkClass}>News</NavLink>
              <NavLink to="/events" onClick={closeMobileMenu} className={mobileNavLinkClass}>Events</NavLink>
              <NavLink to="/resources" onClick={closeMobileMenu} className={mobileNavLinkClass}>Resources</NavLink>
              <NavLink to="/about" onClick={closeMobileMenu} className={mobileNavLinkClass}>About</NavLink>
              <NavLink to="/contact" onClick={closeMobileMenu} className={mobileNavLinkClass}>Contact</NavLink>

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
