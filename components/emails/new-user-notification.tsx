import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components'
import { UserData } from '@/lib/email'

interface NewUserNotificationEmailProps {
  userData: UserData
  isWelcomeEmail?: boolean
}

export default function NewUserNotificationEmail({
  userData,
  isWelcomeEmail = false,
}: NewUserNotificationEmailProps) {
  const {
    id,
    email,
    name,
    avatar_url,
    created_at,
    signup_method,
  } = userData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  const signupMethodIcon = signup_method === 'google' ? '🔍' : '🐙'

  // Different content based on email type
  if (isWelcomeEmail) {
    return (
      <Html>
        <Head />
        <Body style={main}>
          <Container style={container}>
            <Section style={welcomeSection}>
              <Heading style={welcomeTitle}>Welcome to DevToolsHub! 🚀</Heading>
              
              <Text style={welcomeText}>
                Hi {name || 'there'},
              </Text>

              <Text style={welcomeText}>
                Thank you for signing up! We&apos;re excited to have you on board at DevToolsHub.
              </Text>

              <Text style={welcomeText}>
                DevToolsHub provides essential developer tools including:
              </Text>

              <Section style={toolsList}>
                <Text style={toolItem}>• JSON Formatter & Validator</Text>
                <Text style={toolItem}>• Regex Pattern Tester</Text>
                <Text style={toolItem}>• JWT Token Decoder</Text>
                <Text style={toolItem}>• Base64 Encoder/Decoder</Text>
                <Text style={toolItem}>• Image Compressor</Text>
                <Text style={toolItem}>• UUID Generator</Text>
                <Text style={toolItem}>• Timestamp Converter</Text>
                <Text style={toolItem}>• And much more!</Text>
              </Section>

              <Section style={welcomeButtonSection}>
                <Link
                  href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/dashboard`}
                  style={welcomeButton}
                >
                  Get Started →
                </Link>
              </Section>

              <Hr style={hr} />

              <Text style={welcomeFooterText}>
                If you have any questions or feedback, feel free to reach out to us through our support channels.
              </Text>

              <Text style={welcomeFooterText}>
                Happy coding! 🎉<br />
                - The DevToolsHub Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    )
  }

  // Admin notification email
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🎉 New User Signup!</Heading>
            <Text style={headerSubtitle}>Someone just joined DevToolsHub</Text>
          </Section>

          <Hr style={hr} />

          {/* User Information */}
          <Section style={userSection}>
            <div style={userHeader}>
              {avatar_url && (
                <Img
                  src={avatar_url}
                  alt={`${name}'s avatar`}
                  style={avatar}
                />
              )}
              <div>
                <Heading style={userName}>{name}</Heading>
                <Text style={userEmail}>{email}</Text>
              </div>
            </div>

            {/* User Details Grid */}
            <div style={detailsGrid}>
              <div style={detailItem}>
                <Text style={detailLabel}>User ID:</Text>
                <Text style={detailValue}>{id}</Text>
              </div>

              <div style={detailItem}>
                <Text style={detailLabel}>Plan:</Text>
                <Text style={detailValue}>🆓 Free</Text>
              </div>

              <div style={detailItem}>
                <Text style={detailLabel}>Signup Method:</Text>
                <Text style={detailValue}>
                  {signupMethodIcon} {signup_method.toUpperCase()}
                </Text>
              </div>

              <div style={detailItem}>
                <Text style={detailLabel}>Signup Date:</Text>
                <Text style={detailValue}>{formatDate(created_at)}</Text>
              </div>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Quick Actions */}
          <Section style={actionsSection}>
            <Heading style={actionsTitle}>Quick Actions</Heading>
            <div style={actionButtons}>
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
                style={button}
              >
                View Dashboard
              </Link>
              <Link
                href={`mailto:${email}`}
                style={{ ...button, ...buttonSecondary }}
              >
                Email User
              </Link>
            </div>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent from{' '}
              <Link href={process.env.NEXT_PUBLIC_APP_URL} style={footerLink}>
                DevToolsHub
              </Link>
            </Text>
            <Text style={footerText}>
              To manage notifications, please contact us through our support page.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Base Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '0',
  width: '600px',
  maxWidth: '100%',
}

const hr = {
  borderColor: '#f0f0f0',
  margin: '0',
}

// Admin Email Styles
const header = {
  backgroundColor: '#4f46e5',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const headerSubtitle = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '0',
}

const userSection = {
  padding: '24px',
}

const userHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
}

const avatar = {
  borderRadius: '50%',
  width: '60px',
  height: '60px',
  border: '2px solid #e5e7eb',
}

const userName = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  color: '#111827',
}

const userEmail = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
}

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
}

const detailItem = {
  backgroundColor: '#f9fafb',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
}

const detailLabel = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#6b7280',
  margin: '0 0 4px 0',
}

const detailValue = {
  fontSize: '14px',
  color: '#111827',
  margin: '0',
}

const actionsSection = {
  padding: '24px',
  textAlign: 'center' as const,
}

const actionsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  color: '#111827',
}

const actionButtons = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
}

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

const buttonSecondary = {
  backgroundColor: '#6b7280',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '0 0 8px 8px',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const footerLink = {
  color: '#4f46e5',
  textDecoration: 'none',
}

// Welcome Email Styles
const welcomeSection = {
  padding: '24px',
}

const welcomeTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  color: '#111827',
  textAlign: 'center' as const,
}

const welcomeText = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 16px 0',
  lineHeight: '1.6',
}

const toolsList = {
  margin: '0 0 24px 16px',
}

const toolItem = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 4px 0',
  lineHeight: '1.5',
}

const welcomeButtonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const welcomeButton = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

const welcomeLink = {
  color: '#4f46e5',
  textDecoration: 'none',
}

const welcomeFooterText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
} 