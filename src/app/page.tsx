'use client';

import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { BackendError } from "../components/BackendError";
import { ClipboardList, Calendar, MessageCircle, CheckCircle2, Users, Star, ArrowRight, Play, Server, Mail, Phone, MapPin, Twitter, Github, Linkedin } from "lucide-react";

const companies = [
  { name: 'Acme Corp' },
  { name: 'Globex' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Stark Industries' },
];

const features = [
  {
    icon: <ClipboardList size={36} />, title: 'Kanban Boards',
    description: 'Organize your work visually with drag-and-drop boards.'
  },
  {
    icon: <Calendar size={36} />, title: 'Smart Calendar',
    description: 'Schedule, sync, and never miss a deadline again.'
  },
  {
  icon: <MessageCircle className="icon-comment" />, title: 'Team Chat',
    description: 'Collaborate in real time with built-in chat and comments.'
  },
  {
    icon: <CheckCircle2 size={36} />, title: 'Notes & Docs',
    description: 'Take notes, write docs, and keep everything in one place.'
  },
];

const steps = [
  { icon: <Users size={28} />, title: 'Sign Up', desc: 'Create your workspace and invite your team.' },
  { icon: <ClipboardList size={28} />, title: 'Organize', desc: 'Set up boards, tasks, and notes.' },
  { icon: <Calendar size={28} />, title: 'Plan', desc: 'Schedule events and deadlines.' },
  { icon: <MessageCircle className="icon-comment" />, title: 'Collaborate', desc: 'Chat, comment, and get things done together.' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    content: 'WorkSync transformed how our team collaborates. The real-time updates and intuitive interface make project management effortless.',
    avatar: 'SJ',
  },
  {
    name: 'Mike Chen',
    role: 'Design Lead',
    content: 'The drag-and-drop functionality and beautiful UI make task management actually enjoyable. Highly recommended!',
    avatar: 'MC',
  },
  {
    name: 'Emily Davis',
    role: 'Developer',
    content: 'Perfect for our agile workflow. The integration between tasks, notes, and calendar is seamless.',
    avatar: 'ED',
  },
];

export default function LandingPage() {
  // Backend status check for development feedback
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  // Check backend status on component mount
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4100/api';
        console.log('API Base URL:', apiBaseUrl);
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          setBackendStatus('available');
        } else {
          setBackendStatus('unavailable');
        }
      } catch (error) {
        setBackendStatus('unavailable');
      }
    };

    checkBackend();
  }, []);

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address');
      return;
    }

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${apiBaseUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewsletterStatus('success');
        setNewsletterMessage(data.message || 'Thank you for subscribing! We\'ll keep you updated.');
        setNewsletterEmail('');
      } else {
        const errorData = await response.json();
        setNewsletterStatus('error');
        setNewsletterMessage(errorData.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535] relative overflow-x-hidden w-full max-w-full">
      {/* Backend Status Banner */}
      {backendStatus === 'unavailable' && (
        <div className="bg-amber-600 text-white px-4 py-2 text-center text-sm z-50 relative">
          <div className="flex items-center justify-center gap-2">
            <Server className="h-4 w-4" />
            <span>Backend API not available. Some features may not work.</span>
          </div>
        </div>
      )}
      
      {/* Background Effects Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Blobs */}
        <motion.div
          className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#0FC2C0] opacity-30 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full bg-[#008F8C] opacity-30 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#023535] to-[#011a1a] bg-clip-text text-transparent mb-6 drop-shadow"
            >
                WorkSync: All-in-One Productivity
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-[#015958] mb-8 max-w-3xl mx-auto md:mx-0"
            >
              Plan, collaborate, and achieve more with real-time boards, notes, calendar, and smart AI—all in one beautiful workspace.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-12"
            >
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#0FC2C0] to-[#015958] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-[#0CABA8] hover:to-[#008F8C] transition-colors flex items-center gap-2 shadow-lg">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button className="flex items-center gap-2 px-8 py-4 border-2 border-[#0FC2C0] text-[#0FC2C0] rounded-xl text-lg font-semibold hover:bg-[#0FC2C0]/10 transition-colors shadow bg-transparent">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-1 text-[#015958]"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              ))}
              <span className="ml-2 text-white font-medium drop-shadow">4.9/5 from 2,000+ reviews</span>
            </motion.div>
          </div>
          {/* UI Mockup Illustration - Pure CSS/JSX, no SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative w-[350px] h-[220px] bg-white/90 rounded-2xl shadow-2xl border-2 border-[#0FC2C0]/30 overflow-hidden flex flex-col">
              {/* Window controls */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0]/10 border-b border-[#0FC2C0]/20">
                <div className="w-3 h-3 rounded-full bg-[#0FC2C0]" />
                <div className="w-3 h-3 rounded-full bg-[#0CABA8]" />
                <div className="w-3 h-3 rounded-full bg-[#008F8C]" />
              </div>
              {/* Dashboard content */}
              <div className="flex-1 flex flex-col justify-center items-center p-6 gap-3">
                <div className="w-32 h-4 bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] rounded mb-2" />
                <div className="w-48 h-4 bg-gradient-to-r from-[#0CABA8] to-[#008F8C] rounded mb-4" />
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-[#0FC2C0]/30 rounded-lg flex items-center justify-center">
                    <ClipboardList className="text-[#0FC2C0]" size={32} />
                  </div>
                  <div className="w-16 h-16 bg-[#0CABA8]/30 rounded-lg flex items-center justify-center">
                    <Calendar className="text-[#0CABA8]" size={32} />
                  </div>
                  <div className="w-16 h-16 bg-[#008F8C]/30 rounded-lg flex items-center justify-center">
                    <MessageCircle className="text-[#008F8C] icon-comment" />
                  </div>
                </div>
              </div>
              {/* Animated accent blob */}
              <motion.div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-[#0FC2C0] opacity-30 blur-2xl z-0"
                animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>
      </section>
      {/* Trusted By Section */}
      <section className="py-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <span className="text-[#015958] font-medium mb-2">Trusted by teams at</span>
          <div className="flex flex-wrap gap-8 justify-center items-center opacity-80">
            {companies.map((c, i) => (
              <span key={i} className="text-[#015958] text-lg font-semibold tracking-wide opacity-80">{c.name}</span>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#015958] mb-8 text-center">Why WorkSync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl bg-[#015958] text-white shadow p-6 flex flex-col items-center">
                <div className="mb-3 text-[#0FC2C0]">{f.icon}</div>
                <h3 className="mb-1 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-center">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#015958] mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center bg-white/80 rounded-xl shadow p-6 border border-[#0FC2C0]"
              >
                <div className="mb-3 text-[#0FC2C0]">{step.icon}</div>
                <h3 className="mb-1 text-lg font-semibold text-[#015958]">{step.title}</h3>
                <p className="text-sm text-[#015958]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Integrations Section */}
      <section className="py-20 bg-[#0CABA8]/10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#015958] mb-8 text-center">Seamless Integrations</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {['Google Drive', 'Slack', 'GitHub', 'Notion', 'Trello', 'Asana'].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow px-6 py-4 text-[#015958] font-semibold text-lg border border-[#0FC2C0]/20 min-w-[120px] text-center"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#015958] mb-8 text-center">Perfect For...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Teams', desc: 'Collaborate, assign tasks, and track progress together.' },
              { title: 'Freelancers', desc: 'Manage clients, projects, and deadlines in one place.' },
              { title: 'Students', desc: 'Organize study notes, group projects, and schedules.' },
            ].map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0FC2C0]/10 border border-[#0FC2C0]/20 rounded-xl p-8 shadow flex flex-col items-center"
              >
                <h3 className="text-xl font-semibold text-[#015958] mb-2">{uc.title}</h3>
                <p className="text-[#015958] text-center">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Live Demo Section (placeholder) */}
      <section className="py-20 bg-[#015958]/90">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Try the Live Demo</h2>
          <p className="text-[#0FC2C0] mb-8">Experience WorkSync in action! (Coming soon)</p>
          <div className="w-full h-64 bg-[#015958] rounded-xl flex items-center justify-center text-[#0FC2C0] text-2xl font-bold border-4 border-[#0FC2C0]/30 animate-pulse">
            Live Demo Placeholder
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#015958] mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is WorkSync really free?', a: 'Yes! All features are free to use for everyone.' },
              { q: 'Can I use WorkSync with my team?', a: 'Absolutely. Invite as many teammates as you like.' },
              { q: 'Will there be a mobile app?', a: 'Yes, a mobile app is in development.' },
              { q: 'How do I import data from other tools?', a: 'We support integrations and easy import from popular tools like Trello, Asana, and Notion.' },
            ].map((faq, i) => (
              <motion.details
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0FC2C0]/10 border border-[#0FC2C0]/20 rounded-lg p-4"
              >
                <summary className="font-semibold text-[#015958] cursor-pointer">{faq.q}</summary>
                <p className="mt-2 text-[#015958]">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
      {/* Newsletter Signup Section */}
      <section className="py-20 bg-[#0FC2C0]/10">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#015958] mb-4">Stay in the Loop</h2>
          <p className="text-[#015958] mb-6">Get updates on new features, tips, and the upcoming live demo.</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              aria-label="Newsletter email" 
              type="email" 
              placeholder="Your email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterStatus === 'loading'}
              className="px-6 py-3 rounded-lg border border-[#0FC2C0]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <Button 
              type="submit" 
              disabled={newsletterStatus === 'loading'}
              className="bg-gradient-to-r from-[#0FC2C0] to-[#015958] hover:from-[#0CABA8] hover:to-[#008F8C] text-white px-8 py-3 rounded-lg font-semibold shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          
          {/* Status Messages */}
          {newsletterMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              newsletterStatus === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {newsletterMessage}
            </div>
          )}
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-white/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#015958] mb-8 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-[#0FC2C0]"
              >
                <div className="w-12 h-12 rounded-full bg-[#0FC2C0] flex items-center justify-center text-white font-bold text-xl mb-3">
                  {t.avatar}
                </div>
                <p className="text-[#015958] mb-2">“{t.content}”</p>
                <span className="text-[#015958] font-semibold">{t.name}</span>
                <span className="text-[#015958] text-sm">{t.role}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to get started?</h2>
          <p className="text-lg text-white/90 mb-8 drop-shadow">Join thousands of teams and individuals using WorkSync to get more done, together.</p>
          <Link href="/register">
            <Button className="text-lg px-8 py-4 shadow-lg bg-gradient-to-r from-[#0FC2C0] to-[#015958] hover:from-[#0CABA8] hover:to-[#008F8C] text-white">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#015958] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">WorkSync</h3>
              <p className="text-white/80 mb-4 max-w-md">
                The all-in-one productivity platform that helps teams plan, collaborate, and achieve more together. Transform your workflow with intelligent project management.
              </p>
              <div className="flex space-x-4">
                <Link href="https://twitter.com" className="text-white/60 hover:text-[#0FC2C0] transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="https://github.com" className="text-white/60 hover:text-[#0FC2C0] transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="https://linkedin.com" className="text-white/60 hover:text-[#0FC2C0] transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link href="/features" className="hover:text-[#0FC2C0] transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-[#0FC2C0] transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-[#0FC2C0] transition-colors">Integrations</Link></li>
                <li><Link href="/security" className="hover:text-[#0FC2C0] transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link href="/about" className="hover:text-[#0FC2C0] transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-[#0FC2C0] transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-[#0FC2C0] transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-[#0FC2C0] transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-white/20 pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/80">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#0FC2C0]" />
                <span>support@worksync.ng</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#0FC2C0]" />
                <span>+234 (0) 800 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#0FC2C0]" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-white/60">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 WorkSync. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-[#0FC2C0] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#0FC2C0] transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-[#0FC2C0] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
