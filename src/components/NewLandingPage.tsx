import React, { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  ScanText,
  Zap,
  Shield,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';
import OptimizedLogo from './OptimizedLogo';
import { usePerformance, preloadResource } from '../hooks/usePerformance';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LandingPage.css';

const NewLandingPage: React.FC = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const { logPerformanceMetrics } = usePerformance();
  const { user } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles
    createParticles();

    // Animate stats on scroll
    const observeElements = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      });

      elements.forEach((el) => observer.observe(el));
    };

    observeElements();

    // Preload critical resources
    preloadResource('/login', 'document');

    // Log performance metrics
    setTimeout(() => {
      logPerformanceMetrics();
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [logPerformanceMetrics]);

  const createParticles = () => {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      particlesContainer.appendChild(particle);
    }
  };

  const animateCounter = (target: number, elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString();
    }, 20);
  };

  useEffect(() => {
    // Animate counters when component mounts
    setTimeout(() => {
      animateCounter(99.9, 'stat-accuracy');
      animateCounter(85, 'stat-processing');
      animateCounter(24, 'stat-monitoring');
      animateCounter(100, 'stat-uptime');
    }, 1000);
  }, []);

  return (
    <div className="landing-page-new">
      {/* Custom cursor */}
      <div 
        className="cursor" 
        style={{ 
          left: cursorPosition.x - 10, 
          top: cursorPosition.y - 10 
        }}
      />
      <div 
        className="cursor-follower" 
        style={{ 
          left: cursorPosition.x - 20, 
          top: cursorPosition.y - 20 
        }}
      />
      
      {/* Particles container */}
      <div className="particles-container" id="particles" />
      
      {/* Dynamic background */}
      <div className="hero-background" />

      {/* Enhanced Navigation */}
      <nav className={`navigation-new ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container-new">
          <div className="nav-container-new">
            <div className="brand-new" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
              <div className="brand-icon-new">
                <OptimizedLogo size={32} />
              </div>
              <div className="brand-text-new">
                <div className="brand-name-new">Quandrox</div>
                <div className="brand-tagline-new">Tracking System</div>
              </div>
            </div>
            
            <ul className="nav-menu-new">
              <li><a href="#hero">Platform</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#security">Security</a></li>
            </ul>

            <div className="nav-actions-new">
              {user ? (
                <Link to="/dashboard" className="btn-nav-new primary">
                  <ArrowRight size={16} />
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/login" className="btn-nav-new primary">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Revolutionary Hero Section */}
      <section className="hero-new" id="hero">
        <div className="container-new">
          <div className="hero-content-new">

            <h1 className="hero-title-new">
              Transform Fund Disbursement with Intelligent Automation
            </h1>

            {user && (
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '12px 24px',
                borderRadius: '12px',
                marginBottom: '24px',
                color: 'white',
                fontWeight: '600',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
              }}>
                Welcome back, {user.name}! You're successfully logged in.
              </div>
            )}

            <p className="hero-subtitle-new">
              Enterprise-grade withdrawal request platform powered by intelligent form processing, regional intelligence, and bank-level security.
            </p>
            
            <div className="hero-stats-new">
              <div className="hero-stat-new">
                <span className="hero-stat-number-new" id="stat-accuracy">0</span>
                <span className="hero-stat-label-new">% Accuracy Rate</span>
              </div>
              <div className="hero-stat-new">
                <span className="hero-stat-number-new" id="stat-processing">0</span>
                <span className="hero-stat-label-new">% Faster Processing</span>
              </div>
              <div className="hero-stat-new">
                <span className="hero-stat-number-new" id="stat-monitoring">0</span>
                <span className="hero-stat-label-new">/7 Hour Monitoring</span>
              </div>
              <div className="hero-stat-new">
                <span className="hero-stat-number-new" id="stat-uptime">0</span>
                <span className="hero-stat-label-new">% Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="section-new">
        <div className="container-new">
          <div className="section-header-new animate-on-scroll">
            <div className="section-badge-new">
              <Zap size={16} />
              Powerful Features
            </div>
            <h2 className="section-title-new">Built for Enterprise Financial Operations</h2>
            <p className="section-description-new">
              Advanced AI capabilities, intelligent automation, and enterprise-grade security designed for the most demanding financial institutions.
            </p>
          </div>
          
          <div className="features-grid-new">
            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-primary)' }}>
                <ScanText size={40} />
              </div>
              <h3 className="feature-title-new">Intelligent Form Processing</h3>
              <p className="feature-description-new">
                Advanced form validation and processing system ensures accurate data entry and validation. Streamlined workflow processes withdrawal requests efficiently with comprehensive validation.
              </p>
            </div>

            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-success)' }}>
                <Shield size={40} />
              </div>
              <h3 className="feature-title-new">Bank-Level Security</h3>
              <p className="feature-description-new">
                Multi-layered security architecture with end-to-end encryption, role-based access control, and comprehensive audit trails. Compliant with international banking standards.
              </p>
            </div>

            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-warning)' }}>
                <Clock size={40} />
              </div>
              <h3 className="feature-title-new">Real-Time Processing</h3>
              <p className="feature-description-new">
                Instant document processing and validation with real-time status updates. Reduce processing time from hours to minutes with intelligent automation workflows.
              </p>
            </div>

            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-accent)' }}>
                <Users size={40} />
              </div>
              <h3 className="feature-title-new">Multi-Role Management</h3>
              <p className="feature-description-new">
                Comprehensive role-based system supporting administrators, finance managers, operations teams, and end users with customizable permissions and workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="section-new">
        <div className="container-new">
          <div className="section-header-new animate-on-scroll">
            <div className="section-badge-new">
              <Shield size={16} />
              Enterprise Security
            </div>
            <h2 className="section-title-new">Bank-Level Security & Compliance</h2>
            <p className="section-description-new">
              Multi-layered security architecture designed for financial institutions with comprehensive audit trails, encryption, and compliance frameworks.
            </p>
          </div>

          <div className="features-grid-new">
            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-danger)' }}>
                <Shield size={40} />
              </div>
              <h3 className="feature-title-new">End-to-End Encryption</h3>
              <p className="feature-description-new">
                All data is encrypted in transit and at rest using AES-256 encryption. Zero-knowledge architecture ensures that sensitive financial data remains protected at all times.
              </p>
            </div>

            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-warning)' }}>
                <Users size={40} />
              </div>
              <h3 className="feature-title-new">Role-Based Access Control</h3>
              <p className="feature-description-new">
                Granular permission system with multi-factor authentication, session management, and principle of least privilege access for all user roles.
              </p>
            </div>

            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-success)' }}>
                <ScanText size={40} />
              </div>
              <h3 className="feature-title-new">Comprehensive Audit Trails</h3>
              <p className="feature-description-new">
                Complete logging of all system activities with immutable audit trails, real-time monitoring, and automated compliance reporting for regulatory requirements.
              </p>
            </div>

            <div className="feature-card-new animate-on-scroll">
              <div className="feature-icon-new" style={{ background: 'var(--gradient-accent)' }}>
                <Clock size={40} />
              </div>
              <h3 className="feature-title-new">24/7 Security Monitoring</h3>
              <p className="feature-description-new">
                Continuous security monitoring with AI-powered threat detection, automated incident response, and real-time alerts for suspicious activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="section-new" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container-new">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="cta-title-new">
              Ready to Transform Your Financial Operations?
            </h2>
            <p className="cta-description-new">
              Join leading financial institutions worldwide who trust our platform for secure, efficient, and intelligent fund disbursement operations.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <Link to="/dashboard" className="btn-hero-new primary">
                  <ArrowRight size={24} />
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/login" className="btn-hero-new primary">
                  <Rocket size={24} />
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

NewLandingPage.displayName = 'NewLandingPage';

export default NewLandingPage;
