import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { GitHub, LinkedIn, X as XIcon } from '@mui/icons-material';

const AppFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { label: 'About CTEM', href: '/about' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Support Center', href: '/support' },
    ];

    const socialLinks = [
        { icon: GitHub, href: 'https://github.com', label: 'GitHub' },
        { icon: LinkedIn, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: XIcon, href: 'https://x.com', label: 'X' },
    ];

    return (
        <footer className="mt-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-t border-slate-700">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <ShieldCheckIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                                    CTEM SYSTEM
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    Cyber Threat & Exposure Management
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Advanced security monitoring and threat intelligence platform for enterprise-grade protection.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-slate-300 hover:text-white text-sm transition-colors duration-200 hover:underline"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                            Contact
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-300">
                                <EnvelopeIcon className="h-4 w-4 text-blue-400" />
                                <span className="text-sm">security@ctem.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <PhoneIcon className="h-4 w-4 text-blue-400" />
                                <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <MapPinIcon className="h-4 w-4 text-blue-400" />
                                <span className="text-sm">San Francisco, CA</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Status */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                            System Status
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-slate-300 text-sm">All Systems Operational</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-slate-300 text-sm">99.9% Uptime</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="text-slate-300 text-sm">24/7 Monitoring</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-700 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <div className="text-slate-400 text-sm">
                            © {currentYear} CTEM System. All rights reserved. Built with security-first principles.
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <span className="text-slate-400 text-sm hidden sm:block">Follow us:</span>
                            <div className="flex items-center gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-white transition-colors duration-200"
                                            aria-label={social.label}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;