import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Privacy Policy – DevToolsHub',
  description: 'Comprehensive privacy policy for DevToolsHub - Learn how we collect, use, and protect your data.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
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
          <Image src="/icons/icon-48x48.png" alt="DevToolsHub icon" width={24} height={24} className="rounded" />
          <div className="font-semibold docs-title">DevToolsHub Privacy Policy</div>
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
            <h1 className="text-3xl font-bold mb-4 docs-title">Privacy Policy</h1>
            <p className="docs-muted mb-4">Last updated: January 2025</p>
            <p className="content-text">
              DevToolsHub (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our developer tools platform and services.
            </p>
          </section>

          <section className="toc">
            <h2 className="text-xl font-semibold mb-4 docs-title">Table of Contents</h2>
            <ul>
              <li><a href="#information-we-collect">1. Information We Collect</a></li>
              <li><a href="#how-we-use-information">2. How We Use Your Information</a></li>
              <li><a href="#information-sharing">3. Information Sharing and Disclosure</a></li>
              <li><a href="#data-security">4. Data Security</a></li>
              <li><a href="#data-retention">5. Data Retention</a></li>
              <li><a href="#your-rights">6. Your Rights and Choices</a></li>
              <li><a href="#cookies">7. Cookies and Tracking Technologies</a></li>
              <li><a href="#third-party-services">8. Third-Party Services</a></li>
              <li><a href="#international-transfers">9. International Data Transfers</a></li>
              <li><a href="#children-privacy">10. Children&apos;s Privacy</a></li>
              <li><a href="#changes">11. Changes to This Privacy Policy</a></li>
              <li><a href="#contact">12. Contact Us</a></li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="information-we-collect" className="section-title">1. Information We Collect</h2>
            
            <h3 className="subsection-title">1.1 Information You Provide</h3>
            <p className="content-text">We collect information you provide directly to us, including:</p>
            <ul className="content-list">
              <li><strong>Account Information:</strong> When you create an account, we collect your email address, name, and authentication credentials through Supabase Auth.</li>
              <li><strong>Profile Information:</strong> Optional profile data such as avatar images, timezone preferences, and notification settings.</li>
              <li><strong>User Content:</strong> Code snippets, JSON data, regular expressions, and other content you save using our tools.</li>
              <li><strong>Communication:</strong> Information you provide when contacting us for support or feedback.</li>
            </ul>

            <h3 className="subsection-title">1.2 Automatically Collected Information</h3>
            <p className="content-text">We automatically collect certain information when you use our services:</p>
            <ul className="content-list">
              <li><strong>Usage Data:</strong> Information about how you interact with our tools, including tool usage patterns and feature preferences.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, and IP addresses.</li>
              <li><strong>Log Data:</strong> Server logs including access times, pages viewed, and error information.</li>
              <li><strong>Analytics Data:</strong> Aggregated usage statistics to improve our services (when analytics are enabled).</li>
            </ul>

            <div className="highlight-box">
              <strong>Client-Side Processing:</strong> Most of our tools process data locally in your browser. Your inputs are not transmitted to our servers unless you explicitly save them or use premium features that require server processing.
            </div>
          </section>

          <section className="docs-card">
            <h2 id="how-we-use-information" className="section-title">2. How We Use Your Information</h2>
            
            <p className="content-text">We use the information we collect for the following purposes:</p>
            <ul className="content-list">
              <li><strong>Service Provision:</strong> To provide, maintain, and improve our developer tools and services.</li>
              <li><strong>Account Management:</strong> To create and manage your account, process payments, and provide customer support.</li>
              <li><strong>Personalization:</strong> To customize your experience and provide relevant tool recommendations.</li>
              <li><strong>Communication:</strong> To send you important updates, security notices, and support messages.</li>
              <li><strong>Analytics:</strong> To analyze usage patterns and improve our platform&apos;s performance and user experience.</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="information-sharing" className="section-title">3. Information Sharing and Disclosure</h2>
            
            <p className="content-text">We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            
            <h3 className="subsection-title">3.1 Service Providers</h3>
            <p className="content-text">We may share information with trusted third-party service providers who assist us in operating our platform:</p>
            <ul className="content-list">
              <li><strong>Supabase:</strong> For authentication, database services, and file storage.</li>
              <li><strong>Vercel:</strong> For hosting and deployment services.</li>
              <li><strong>Stripe:</strong> For payment processing (if applicable).</li>
              <li><strong>Analytics Providers:</strong> For usage analytics and performance monitoring.</li>
            </ul>

            <h3 className="subsection-title">3.2 Legal Requirements</h3>
            <p className="content-text">We may disclose your information if required by law or in response to valid legal requests, such as subpoenas or court orders.</p>

            <h3 className="subsection-title">3.3 Business Transfers</h3>
            <p className="content-text">In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>

            <h3 className="subsection-title">3.4 With Your Consent</h3>
            <p className="content-text">We may share your information with third parties when you explicitly consent to such sharing.</p>
          </section>

          <section className="docs-card">
            <h2 id="data-security" className="section-title">4. Data Security</h2>
            
            <p className="content-text">We implement appropriate technical and organizational security measures to protect your information:</p>
            <ul className="content-list">
              <li><strong>Encryption:</strong> Data is encrypted in transit using TLS/SSL and at rest using industry-standard encryption.</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication mechanisms to protect your data.</li>
              <li><strong>Row Level Security:</strong> Database-level security policies to ensure users can only access their own data.</li>
              <li><strong>Regular Security Audits:</strong> We conduct regular security assessments and updates.</li>
              <li><strong>Secure Development:</strong> We follow secure coding practices and regularly update dependencies.</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="data-retention" className="section-title">5. Data Retention</h2>
            
            <p className="content-text">We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy:</p>
            <ul className="content-list">
              <li><strong>Account Data:</strong> Retained for the duration of your account and for a reasonable period after account deletion for legal compliance.</li>
              <li><strong>User Content:</strong> Retained until you delete it or close your account.</li>
              <li><strong>Log Data:</strong> Retained for up to 12 months for security and debugging purposes.</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely for service improvement.</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="your-rights" className="section-title">6. Your Rights and Choices</h2>
            
            <p className="content-text">You have the following rights regarding your personal information:</p>
            <ul className="content-list">
              <li><strong>Access:</strong> You can request access to the personal information we hold about you.</li>
              <li><strong>Correction:</strong> You can request correction of inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> You can request deletion of your personal information, subject to legal requirements.</li>
              <li><strong>Portability:</strong> You can request a copy of your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> You can object to certain processing of your personal information.</li>
              <li><strong>Withdrawal of Consent:</strong> You can withdraw consent for processing based on consent.</li>
            </ul>

            <p className="content-text">To exercise these rights, please contact us using the information provided in the Contact Us section.</p>
          </section>

          <section className="docs-card">
            <h2 id="cookies" className="section-title">7. Cookies and Tracking Technologies</h2>
            
            <p className="content-text">We use cookies and similar tracking technologies to enhance your experience:</p>
            
            <h3 className="subsection-title">7.1 Types of Cookies</h3>
            <ul className="content-list">
              <li><strong>Essential Cookies:</strong> Required for basic functionality and security.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform.</li>
            </ul>

            <h3 className="subsection-title">7.2 Cookie Management</h3>
            <p className="content-text">You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our services.</p>
          </section>

          <section className="docs-card">
            <h2 id="third-party-services" className="section-title">8. Third-Party Services</h2>
            
            <p className="content-text">Our platform integrates with third-party services that have their own privacy policies:</p>
            <ul className="content-list">
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>Google OAuth:</strong> Sign-in authentication</li>
              <li><strong>GitHub OAuth:</strong> Sign-in authentication</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
            </ul>
            
            <p className="content-text">We encourage you to review the privacy policies of these third-party services.</p>
          </section>

          <section className="docs-card">
            <h2 id="international-transfers" className="section-title">9. International Data Transfers</h2>
            
            <p className="content-text">Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including:</p>
            <ul className="content-list">
              <li>Standard contractual clauses approved by relevant authorities</li>
              <li>Adequacy decisions by relevant authorities</li>
              <li>Other appropriate safeguards as required by applicable law</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 id="children-privacy" className="section-title">10. Children&apos;s Privacy</h2>
            
            <p className="content-text">Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
          </section>

          <section className="docs-card">
            <h2 id="changes" className="section-title">11. Changes to This Privacy Policy</h2>
            
            <p className="content-text">We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
            <ul className="content-list">
              <li>Posting the updated policy on our website</li>
              <li>Sending you an email notification</li>
              <li>Displaying a notice on our platform</li>
            </ul>
            
            <p className="content-text">Your continued use of our services after any changes indicates your acceptance of the updated Privacy Policy.</p>
          </section>

          <section className="docs-card">
            <h2 id="contact" className="section-title">12. Contact Us</h2>
            
            <p className="content-text">If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <ul className="content-list">
              <li><strong>Email:</strong> contactme@devtoolshub.com</li>
              <li><strong>Support:</strong> <a href="/support" className="docs-nav">Contact Support</a></li>
            </ul>
            
            <p className="content-text">We will respond to your inquiry within 30 days.</p>
          </section>

          <section className="docs-card">
            <div className="highlight-box">
              <strong>Data Protection Officer:</strong> If you are located in the European Union, you may also contact our Data Protection Officer at dpo@devtoolshub.com for privacy-related inquiries.
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}


