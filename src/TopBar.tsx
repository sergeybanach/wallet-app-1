import { useState, useEffect, useRef } from 'react';
import { auth } from './firebase';
import { signOut, User } from 'firebase/auth';

// Base64-encoded default profile image (gray circle with user icon)
const DEFAULT_PROFILE_IMAGE = 
    '/default-profile.jpg';

interface TopBarProps {
  user: User;
}

function TopBar({ user }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container
  const profileImgRef = useRef<HTMLImageElement>(null); // Ref for the profile image

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully');
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleMenu = () => {
    console.log('Toggling menu, current state:', isMenuOpen); // Debug log
    setIsMenuOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        profileImgRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !profileImgRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]); // Re-run effect when isMenuOpen changes

  return (
    <div className="bg-white shadow-md p-4 flex items-center justify-between relative">
      {/* Left side: User info */}
      <div>
        <p className="text-lg font-semibold">{user.displayName || 'User'}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>

      {/* Right side: Profile picture and dropdown */}
      <div className="relative">
        <img
          ref={profileImgRef} // Attach ref to profile image
          src={user.photoURL || DEFAULT_PROFILE_IMAGE}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={toggleMenu}
        />
        {/* Dropdown Menu */}
        <div
          ref={menuRef} // Attach ref to dropdown
          className={`absolute top-full mt-2 right-0 bg-white shadow-lg rounded-md w-40 z-50 ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <ul className="py-2 text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                console.log('Profile clicked');
                setIsMenuOpen(false);
              }}
            >
              Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TopBar;