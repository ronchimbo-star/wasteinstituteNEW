import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import logo from '../assets/waste-institute-logo-new-paths-light.svg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#00112b' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <img src={logo} alt="WasteInstitute" className="h-15" />
            <p className="text-gray-300 text-sm">
              Empowering sustainable waste management through education and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/verify"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Verify Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@wasteinstitute.org"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  info@wasteinstitute.org
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+441322879087"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  +44 (01322) 879 087
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  82 James Carter Rd,<br />
                  Mildenhall, Bury Saint Edmunds<br />
                  IP28 7DE, United Kingdom
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Linkedin className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                <a
                  href="https://www.linkedin.com/company/wasteinstitute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300 text-sm">
              Copyright &copy; 2026 WasteInstitute.org. All Rights Reserved. Empowering Waste Management Worldwide.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Cookies
              </Link>
              <Link
                to="/accessibility"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
