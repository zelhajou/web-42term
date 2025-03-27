import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">42widgets</h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Beautiful widgets for 42 School students to showcase their skills, projects, and achievements 
              on GitHub and other platforms.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/widgets/skills" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Skills Widgets
                </Link>
              </li>
              <li>
                <Link href="/widgets/projects" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Projects Widgets
                </Link>
              </li>
              <li>
                <Link href="/widgets/stats" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Stats Widgets
                </Link>
              </li>
              <li>
                <Link href="/widgets/coalition" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Coalition Widgets
                </Link>
              </li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">About</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  About 42widgets
                </Link>
              </li>
              <li>
                <a href="https://github.com/username/42widgets" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://42.fr/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  About 42 School
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            &copy; {new Date().getFullYear()} 42widgets. Made with ❤️ by 42 students for 42 students.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            This website is not officially affiliated with 42 School. All 42 trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;