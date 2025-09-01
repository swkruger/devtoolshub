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
import { getEmailApplicationName } from '@/lib/app-config'

interface LoginAlertEmailProps {
  userData: {
    id: string
    email: string
    name?: string
    avatar_url?: string
  }
  loginData: {
    timestamp: string
    ipAddress: string
    userAgent: string
    location?: string
    deviceType: string
    browser: string
  }
}

export default function LoginAlertEmail({
  userData,
  loginData,
}: LoginAlertEmailProps) {
  const { id, email, name, avatar_url } = userData
  const { timestamp, ipAddress, userAgent, location, deviceType, browser } = loginData

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

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🔐 Welcome Back to {getEmailApplicationName()}!</Heading>
            <Text style={headerSubtitle}>Your account was accessed successfully</Text>
          </Section>

          <Hr style={hr} />

          {/* Welcome Message */}
          <Section style={contentSection}>
            <Text style={greetingText}>
              Hi {name || 'there'},
            </Text>

            <Text style={contentText}>
              Welcome back! We&apos;re glad to see you again at {getEmailApplicationName()}. Your account was accessed successfully.
            </Text>

            <Text style={contentText}>
              Here are the details of your recent login:
            </Text>

            {/* Login Details */}
            <Section style={detailsSection}>
              <div style={detailsGrid}>
                <div style={detailItem}>
                  <Text style={detailLabel}>📅 Login Time:</Text>
                  <Text style={detailValue}>{formatDate(timestamp)}</Text>
                </div>

                <div style={detailItem}>
                  <Text style={detailLabel}>🌐 IP Address:</Text>
                  <Text style={detailValue}>{ipAddress}</Text>
                </div>

                <div style={detailItem}>
                  <Text style={detailLabel}>💻 Device:</Text>
                  <Text style={detailValue}>{deviceType}</Text>
                </div>

                <div style={detailItem}>
                  <Text style={detailLabel}>🔍 Browser:</Text>
                  <Text style={detailValue}>{browser}</Text>
                </div>

                {location && (
                  <div style={detailItem}>
                    <Text style={detailLabel}>📍 Location:</Text>
                    <Text style={detailValue}>{location}</Text>
                  </div>
                )}
              </div>
            </Section>

            {/* Security Notice */}
            <Section style={securitySection}>
              <Heading style={securityTitle}>🔒 Security Notice</Heading>
              
              <Text style={securityText}>
                <strong>If this was you:</strong> You can safely ignore this email. Your account is secure and you&apos;re all set to continue using {getEmailApplicationName()}.
              </Text>

              <Text style={securityText}>
                <strong>If this wasn&apos;t you:</strong> Please take immediate action to secure your account:
              </Text>

              <Section style={actionList}>
                <Text style={actionItem}>1. <strong>Change your password</strong> immediately</Text>
                <Text style={actionItem}>2. <strong>Enable two-factor authentication</strong> if not already enabled</Text>
                <Text style={actionItem}>3. <strong>Review your account activity</strong> in your settings</Text>
                <Text style={actionItem}>4. <strong>Contact our support team</strong> if you need assistance</Text>
              </Section>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/dashboard`}
                style={primaryButton}
              >
                Go to Dashboard →
              </Link>
              
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/settings`}
                style={secondaryButton}
              >
                Account Settings
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security notification from{' '}
              <Link href={process.env.NEXT_PUBLIC_APP_URL} style={footerLink}>
                {getEmailApplicationName()}
              </Link>
            </Text>
            
            <Text style={footerText}>
              If you have any concerns about your account security, please contact us immediately through our support page.
            </Text>

            <Text style={footerText}>
              Stay safe and happy coding! 🛡️<br />
              - The {getEmailApplicationName()} Security Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
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

const header = {
  backgroundColor: '#10b981',
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
  color: '#d1fae5',
  fontSize: '14px',
  margin: '0',
}

const contentSection = {
  padding: '24px',
}

const greetingText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
}

const contentText = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 16px 0',
  lineHeight: '1.6',
}

const detailsSection = {
  margin: '24px 0',
}

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
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

const securitySection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #f59e0b',
}

const securityTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 16px 0',
}

const securityText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
}

const actionList = {
  margin: '16px 0 0 16px',
}

const actionItem = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const primaryButton = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 8px 8px 0',
}

const secondaryButton = {
  backgroundColor: '#6b7280',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 8px 8px 0',
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
  color: '#10b981',
  textDecoration: 'none',
}
