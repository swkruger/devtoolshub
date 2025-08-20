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

interface NewDeviceAlertEmailProps {
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
  previousLoginData?: {
    timestamp: string
    ipAddress: string
    deviceType: string
    browser: string
  }
}

export default function NewDeviceAlertEmail({
  userData,
  loginData,
  previousLoginData,
}: NewDeviceAlertEmailProps) {
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
            <Heading style={headerTitle}>⚠️ New Device Login Alert</Heading>
            <Text style={headerSubtitle}>Your account was accessed from a new device</Text>
          </Section>

          <Hr style={hr} />

          {/* Alert Message */}
          <Section style={contentSection}>
            <Text style={greetingText}>
              Hi {name || 'there'},
            </Text>

            <Text style={contentText}>
              We detected a login to your DevToolsHub account from a new device. This could be you logging in from a different computer, browser, or location.
            </Text>

            <Text style={contentText}>
              <strong>If this was you:</strong> You can safely ignore this email. Your account is secure.
            </Text>

            <Text style={contentText}>
              <strong>If this wasn&apos;t you:</strong> Please take immediate action to secure your account.
            </Text>

            {/* New Login Details */}
            <Section style={detailsSection}>
              <Heading style={detailsTitle}>🔍 New Login Details</Heading>
              
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

            {/* Previous Login Comparison */}
            {previousLoginData && (
              <Section style={previousSection}>
                <Heading style={previousTitle}>📊 Previous Login</Heading>
                
                <div style={detailsGrid}>
                  <div style={detailItem}>
                    <Text style={detailLabel}>📅 Last Login:</Text>
                    <Text style={detailValue}>{formatDate(previousLoginData.timestamp)}</Text>
                  </div>

                  <div style={detailItem}>
                    <Text style={detailLabel}>🌐 IP Address:</Text>
                    <Text style={detailValue}>{previousLoginData.ipAddress}</Text>
                  </div>

                  <div style={detailItem}>
                    <Text style={detailLabel}>💻 Device:</Text>
                    <Text style={detailValue}>{previousLoginData.deviceType}</Text>
                  </div>

                  <div style={detailItem}>
                    <Text style={detailLabel}>🔍 Browser:</Text>
                    <Text style={detailValue}>{previousLoginData.browser}</Text>
                  </div>
                </div>
              </Section>
            )}

            {/* Security Actions */}
            <Section style={securitySection}>
              <Heading style={securityTitle}>🛡️ Security Actions</Heading>
              
              <Text style={securityText}>
                <strong>If you don&apos;t recognize this login:</strong>
              </Text>

              <Section style={actionList}>
                <Text style={actionItem}>1. <strong>Immediately revoke all sessions</strong> in your account settings</Text>
                <Text style={actionItem}>2. <strong>Change your password</strong> if you have one set</Text>
                <Text style={actionItem}>3. <strong>Enable two-factor authentication</strong> for extra security</Text>
                <Text style={actionItem}>4. <strong>Review your account activity</strong> for any suspicious actions</Text>
                <Text style={actionItem}>5. <strong>Contact our support team</strong> immediately if you need help</Text>
              </Section>

              <Text style={securityText}>
                <strong>If this was you:</strong> No action is required. You can safely continue using your account.
              </Text>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/settings`}
                style={primaryButton}
              >
                Review Account Settings →
              </Link>
              
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/dashboard`}
                style={secondaryButton}
              >
                Go to Dashboard
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security alert from{' '}
              <Link href={process.env.NEXT_PUBLIC_APP_URL} style={footerLink}>
                DevToolsHub
              </Link>
            </Text>
            
            <Text style={footerText}>
              For immediate assistance with security concerns, contact us at{' '}
              <Link href="mailto:devtoolshub8@gmail.com" style={footerLink}>
                devtoolshub8@gmail.com
              </Link>
            </Text>

            <Text style={footerText}>
              Your security is our top priority! 🔒<br />
              - The DevToolsHub Security Team
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
  backgroundColor: '#f59e0b',
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
  color: '#fef3c7',
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

const detailsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
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

const previousSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
}

const previousTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#374151',
  margin: '0 0 16px 0',
}

const securitySection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
}

const securityTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 16px 0',
}

const securityText = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
}

const actionList = {
  margin: '16px 0 0 16px',
}

const actionItem = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const primaryButton = {
  backgroundColor: '#dc2626',
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
  color: '#dc2626',
  textDecoration: 'none',
}
