import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface EnsExpiryEmailProps {
  userName?: string;
  domains: Array<{
    name: string;
    expiryDate: string;
    daysLeft: number;
  }>;
}

export function EnsExpiryEmail({ userName, domains }: EnsExpiryEmailProps) {
  const previewText = `Your ENS domains are expiring soon!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={logo}>KeepENS</Heading>
          </Section>

          <Heading style={h1}>⚠️ Your ENS Domains Are Expiring Soon</Heading>

          <Text style={text}>
            Hello {userName || 'there'},
          </Text>

          <Text style={text}>
            We wanted to let you know that {domains.length === 1 ? 'your ENS domain' : 'some of your ENS domains'}
            {domains.length === 1 ? ' is' : ' are'} expiring soon and may need your attention.
          </Text>

          <Section style={domainsContainer}>
            {domains.map((domain, index) => (
              <Section key={index} style={domainCard}>
                <Heading style={domainName}>{domain.name}</Heading>
                <Text style={domainDetails}>
                  <strong>Expires:</strong> {domain.expiryDate}
                </Text>
                <Text style={domainDetails}>
                  <strong>Days Left:</strong> {domain.daysLeft} days
                </Text>
                <Link
                  href={`https://app.ens.domains/name/${domain.name}/register`}
                  style={button}
                >
                  Renew Domain
                </Link>
              </Section>
            ))}
          </Section>

          <Text style={text}>
            Don't lose your valuable ENS domains! Click the "Renew Domain" button above
            to extend your registration.
          </Text>

          <Text style={text}>
            If you no longer wish to receive these notifications, you can unsubscribe
            by visiting our website and managing your subscriptions.
          </Text>

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by KeepENS.
              We're here to help you keep track of your ENS domains.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 32px 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 16px',
};

const domainsContainer = {
  margin: '32px 0',
};

const domainCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const domainName = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const domainDetails = {
  color: '#64748b',
  fontSize: '14px',
  margin: '8px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '16px 0 0 0',
  width: 'fit-content',
};

const footer = {
  borderTop: '1px solid #e2e8f0',
  marginTop: '32px',
  paddingTop: '20px',
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
};
