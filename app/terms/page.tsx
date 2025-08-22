import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service – DevToolsHub',
  description: 'Terms of Service for DevToolsHub - Learn about the terms and conditions for using our developer tools platform.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  const css = `
    :root { --bg:#f8fafc; --fg:#0f172a; --muted:#475569; --border:#e5e7eb; --card:#ffffff; --link:#2563eb; --linkh:#1d4ed8; }
    @media (prefers-color-scheme: dark){ :root { --bg:#0b0b0b; --fg:#eaeaea; --muted:#a3a3a3; --border:#222; --card:#0f172a; --link:#8ab4ff; --linkh:#a7c1ff; } }
    .docs-header { background: var(--card); border-bottom: 1px solid var(--border); }
    .docs-nav a { color: var(--link); text-decoration: none; }
    .docs-nav a:hover { color: var(--linkh); text-decoration: underline; }
    .docs-title { color: var(--fg); }
    .docs-muted { color: var(--muted); }
    .docs-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .toc { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .toc ul { list-style: none; padding: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: var(--link); text-decoration: none; }
    .toc a:hover { color: var(--linkh); text-decoration: underline; }
    .section-title { color: var(--fg); margin-top: 32px; margin-bottom: 16px; }
    .subsection-title { color: var(--fg); margin-top: 24px; margin-bottom: 12px; }
    .content-text { line-height: 1.6; margin-bottom: 16px; }
    .content-list { margin-left: 20px; margin-bottom: 16px; }
    .content-list li { margin-bottom: 8px; }
    .highlight-box { background: rgba(37, 99, 235, 0.1); border-left: 4px solid var(--link); padding: 16px; margin: 16px 0; border-radius: 4px; }
  `
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header className="docs-header">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <img src="/icons/icon-48x48.png" alt="DevToolsHub icon" width={24} height={24} className="rounded" />
          <div className="font-semibold docs-title">DevToolsHub Terms of Service</div>
          <nav className="ml-auto flex items-center gap-4 text-sm docs-nav">
            <a href="/">Home</a>
            <a href="/#tools">All Tools</a>
            <a href="/docs">Docs</a>
            <a href="/changelog">Changelog</a>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="space-y-6 max-w-4xl">
          <section className="docs-card">
            <h1 className="text-3xl font-bold mb-4 docs-title">Terms of Service</h1>
            <p className="docs-muted mb-4">Last updated: January 2025</p>
            <p className="content-text">
              These Terms of Service ("Terms") govern your use of DevToolsHub ("we," "our," or "us") and our developer tools platform and services. By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="toc">
            <h2 className="text-xl font-semibold mb-4 docs-title">Table of Contents</h2>
            <ul>
              <li><a href="#acceptance">1. Acceptance of Terms</a></li>
              <li><a href="#services">2. Description of Services</a></li>
              <li><a href="#accounts">3. User Accounts</a></li>
              <li><a href="#acceptable-use">4. Acceptable Use</a></li>
              <li><a href="#intellectual-property">5. Intellectual Property</a></li>
              <li><a href="#user-content">6. User Content</a></li>
              <li><a href="#premium-features">7. Premium Features</a></li>
              <li><a href="#disclaimers">8. Disclaimers</a></li>
              <li><a href="#limitation-liability">9. Limitation of Liability</a></li>
              <li><a href="#indemnification">10. Indemnification</a></li>
              <li><a href="#termination">11. Termination</a></li>
              <li><a href="#governing-law">12. Governing Law</a></li>
              <li><a href="#changes">13. Changes to Terms</a></li>
              <li><a href="#contact">14. Contact Information</a></li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="acceptance" className="section-title">1. Acceptance of Terms</h2>
            <p className="content-text">
              By accessing or using DevToolsHub, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="services" className="section-title">2. Description of Services</h2>
            <p className="content-text">
              DevToolsHub provides a collection of developer tools and utilities, including but not limited to:
            </p>
            <ul className="content-list">
              <li>JSON formatting and validation</li>
              <li>Regular expression testing</li>
              <li>JWT decoding and verification</li>
              <li>Base64 encoding and decoding</li>
              <li>UUID generation</li>
              <li>Timestamp conversion</li>
              <li>XPath and CSS selector testing</li>
              <li>Image compression</li>
              <li>World clock and timezone utilities</li>
              <li>Password and key generation</li>
              <li>PWA asset generation</li>
            </ul>
            <p className="content-text">
              We reserve the right to modify, suspend, or discontinue any part of our services at any time.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="accounts" className="section-title">3. User Accounts</h2>
            <p className="content-text">
              To access certain features of our services, you may need to create an account. You are responsible for:
            </p>
            <ul className="content-list">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information when creating your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="content-text">
              We reserve the right to terminate accounts that violate these Terms or are inactive for extended periods.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="acceptable-use" className="section-title">4. Acceptable Use</h2>
            <p className="content-text">
              You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="content-list">
              <li>Use our services for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt the operation of our services</li>
              <li>Use our services to transmit malware, viruses, or other harmful code</li>
              <li>Attempt to reverse engineer or decompile our services</li>
              <li>Use our services for commercial purposes without proper authorization</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="intellectual-property" className="section-title">5. Intellectual Property</h2>
            <p className="content-text">
              Our services and their original content, features, and functionality are owned by DevToolsHub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="content-text">
              You may not copy, modify, distribute, sell, or lease any part of our services without our prior written consent.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="user-content" className="section-title">6. User Content</h2>
            <p className="content-text">
              You retain ownership of any content you submit to our services. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and display that content in connection with providing our services.
            </p>
            <p className="content-text">
              You are responsible for ensuring that any content you submit:
            </p>
            <ul className="content-list">
              <li>Does not violate any third-party rights</li>
              <li>Is not illegal, harmful, or offensive</li>
              <li>Does not contain sensitive or confidential information</li>
              <li>Complies with these Terms</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="premium-features" className="section-title">7. Premium Features</h2>
            <p className="content-text">
              Some features of our services may require a premium subscription. Premium features are subject to additional terms and conditions, including payment terms and usage limitations.
            </p>
            <p className="content-text">
              We reserve the right to modify premium features, pricing, and availability at any time with appropriate notice.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="disclaimers" className="section-title">8. Disclaimers</h2>
            <p className="content-text">
              Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that:
            </p>
            <ul className="content-list">
              <li>Our services will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>Our services are free of viruses or other harmful components</li>
              <li>The results obtained from using our services will be accurate or reliable</li>
            </ul>
            <div className="highlight-box">
              <strong>Important:</strong> Our tools are designed for development and testing purposes. Always verify results in your production environment and do not rely solely on our tools for critical decisions.
            </div>
          </section>

          <section className="docs-card">
            <h2 id="limitation-liability" className="section-title">9. Limitation of Liability</h2>
            <p className="content-text">
              In no event shall DevToolsHub be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="content-list">
              <li>Your use or inability to use our services</li>
              <li>Any unauthorized access to or use of our servers and/or personal information</li>
              <li>Any interruption or cessation of transmission to or from our services</li>
              <li>Any bugs, viruses, or other harmful code that may be transmitted through our services</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="indemnification" className="section-title">10. Indemnification</h2>
            <p className="content-text">
              You agree to defend, indemnify, and hold harmless DevToolsHub from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of our services or violation of these Terms.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="termination" className="section-title">11. Termination</h2>
            <p className="content-text">
              We may terminate or suspend your account and access to our services immediately, without prior notice, for any reason, including breach of these Terms.
            </p>
            <p className="content-text">
              Upon termination, your right to use our services will cease immediately, and we may delete your account and any associated data.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="governing-law" className="section-title">12. Governing Law</h2>
            <p className="content-text">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="changes" className="section-title">13. Changes to Terms</h2>
            <p className="content-text">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by:
            </p>
            <ul className="content-list">
              <li>Posting the updated Terms on our website</li>
              <li>Sending email notifications to registered users</li>
              <li>Displaying a notice on our platform</li>
            </ul>
            <p className="content-text">
              Your continued use of our services after any changes indicates your acceptance of the updated Terms.
            </p>
          </section>

          <section className="docs-card">
            <h2 id="contact" className="section-title">14. Contact Information</h2>
            <p className="content-text">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="content-list">
              <li><strong>Email:</strong> contactme@devtoolshub.com</li>
              <li><strong>Support:</strong> <a href="/support" className="docs-nav">Contact Support</a></li>
            </ul>
          </section>

          <section className="docs-card">
            <div className="highlight-box">
              <strong>Effective Date:</strong> These Terms of Service are effective as of January 2025 and will remain in effect except with respect to any changes in their provisions in the future.
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
