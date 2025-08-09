import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Text,
} from "@react-email/components"
import dayjs from "dayjs"

interface OrgInvitationProps {
	email: string
	invitedByUsername: string
	invitedByEmail: string
	orgName: string
	inviteLink: string
}

export const OrgInvitationTemplate = ({ email, invitedByUsername, invitedByEmail, orgName, inviteLink }: OrgInvitationProps) => {
	const orgAvatar = "https://kf9653eimo.ufs.sh/f/JLwV8LM67suiZK8ap69z12uFvPBalx90RDhSAbJm4GrMkjdV"

	return (
		<Html>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<Preview>You\'re invited to join {orgName} on Jelli</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Section style={styles.header}>
						<Row>
							<Column>
								<Img src={orgAvatar} alt="Org" width="64" height="64" style={styles.logo} />
							</Column>
						</Row>
					</Section>

					<Section style={styles.mainContent}>
						<Heading style={styles.heading}>Invitation to join {orgName}</Heading>
						<Text style={styles.subheading}>You\'ve been invited to collaborate</Text>

						<Section style={styles.contentCard}>
							<Text style={styles.greeting}>Hello {email},</Text>
							<Text style={styles.paragraph}>
								<b>{invitedByUsername}</b> ({invitedByEmail}) has invited you to join the organization <b>{orgName}</b> on Jelli.
							</Text>
							<Text style={styles.paragraph}>Click the button below to accept your invitation and get started.</Text>

							<Section style={styles.buttonContainer}>
								<Button style={styles.button} href={inviteLink}>
									Accept Invitation
								</Button>
							</Section>
						</Section>

						<Section style={styles.securitySection}>
							<div style={styles.securityHeader}>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									style={styles.securityIcon}
								>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
								</svg>
								<Text style={styles.securityTitle}>Security Information</Text>
							</div>
							<ul style={styles.securityList}>
								<li style={styles.securityItem}>This invitation link may expire for security reasons</li>
								<li style={styles.securityItem}>If you did not expect this invitation, you can safely ignore this email</li>
								<li style={styles.securityItem}>Only accept invitations from people and organizations you trust</li>
							</ul>
						</Section>

						<Text style={styles.noteText}>If the button doesn\'t work, copy and paste this link into your browser: {inviteLink}</Text>
					</Section>

					<Section style={styles.footer}>
						<Text style={styles.copyright}>© {dayjs().year()} Jelli. All rights reserved.</Text>
						<div style={styles.footerLinks}>
							<Link href="#" style={styles.link}>
								Privacy Policy
							</Link>
							<span style={styles.divider}>•</span>
							<Link href="#" style={styles.link}>
								Terms of Service
							</Link>
							<span style={styles.divider}>•</span>
							<Link href="#" style={styles.link}>
								Contact Support
							</Link>
						</div>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

const styles = {
	body: {
		backgroundColor: "oklch(0.98 0 0)",
		fontFamily: "Geist Mono, monospace",
		margin: 0,
		padding: "24px",
		color: "oklch(0.24 0 0)",
		letterSpacing: "0.05em",
	},
	container: {
		width: "100%",
		maxWidth: "550px",
		margin: "0 auto",
		backgroundColor: "oklch(0.99 0 0)",
		borderRadius: "0.3rem",
		overflow: "hidden",
		boxShadow: "0 1px 5px 0.5px hsl(0 0% 10.20% / 0.20), 0 2px 4px -0.5px hsl(0 0% 10.20% / 0.20)",
	},
	header: {
		backgroundColor: "oklch(0.44 0.04 44.87)",
		padding: "32px 0",
		textAlign: "center" as const,
	},
	logo: {
		borderRadius: "50%",
		boxShadow: "0 1px 5px 0.5px hsl(0 0% 10.20% / 0.20), 0 1px 2px -0.5px hsl(0 0% 10.20% / 0.20)",
		border: "2px solid oklch(1.00 0 0)",
		margin: "0 auto",
		display: "block",
		backgroundColor: "oklch(1.00 0 0)",
	},
	mainContent: {
		backgroundColor: "oklch(0.99 0 0)",
		padding: "32px 36px",
		color: "oklch(0.24 0 0)",
	},
	heading: {
		fontSize: "26px",
		fontWeight: "700",
		color: "oklch(0.24 0 0)",
		textAlign: "center" as const,
		margin: "0 0 8px",
		lineHeight: "1.3",
		fontFamily: "Inter, sans-serif",
	},
	subheading: {
		fontSize: "16px",
		color: "oklch(0.50 0 0)",
		textAlign: "center" as const,
		margin: "0 0 28px",
		fontWeight: "400",
	},
	contentCard: {
		backgroundColor: "oklch(0.95 0 0)",
		borderRadius: "0.3rem",
		padding: "24px",
		marginBottom: "28px",
		border: "1px solid oklch(0.88 0 0)",
	},
	greeting: {
		fontSize: "18px",
		fontWeight: "600",
		color: "oklch(0.24 0 0)",
		margin: "0 0 16px",
		fontFamily: "Inter, sans-serif",
	},
	paragraph: {
		fontSize: "16px",
		lineHeight: "1.6",
		color: "oklch(0.24 0 0)",
		margin: "0 0 24px",
	},
	buttonContainer: {
		textAlign: "center" as const,
		margin: "24px 0 8px",
	},
	button: {
		backgroundColor: "oklch(0.44 0.04 44.87)",
		borderRadius: "0.3rem",
		color: "oklch(1.00 0 0)",
		fontSize: "16px",
		fontWeight: "600",
		textDecoration: "none",
		textAlign: "center" as const,
		display: "inline-block",
		padding: "12px 28px",
		border: "none",
		boxShadow: "0 1px 5px 0.5px hsl(0 0% 10.20% / 0.20), 0 1px 2px -0.5px hsl(0 0% 10.20% / 0.20)",
	},
	securitySection: {
		margin: "28px 0 24px",
		padding: "20px",
		backgroundColor: "oklch(0.93 0 0)",
		borderRadius: "0.3rem",
		border: "1px solid oklch(0.88 0 0)",
	},
	securityHeader: {
		display: "flex",
		alignItems: "center",
		marginBottom: "12px",
	},
	securityIcon: {
		color: "oklch(0.50 0 0)",
		marginRight: "8px",
	},
	securityTitle: {
		fontSize: "16px",
		fontWeight: "600",
		color: "oklch(0.24 0 0)",
		margin: "0",
		fontFamily: "Inter, sans-serif",
	},
	securityList: {
		margin: "10px 0 0",
		paddingLeft: "20px",
	},
	securityItem: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)",
		margin: "0 0 8px",
		lineHeight: "1.5",
	},
	noteText: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)",
		fontStyle: "italic",
		lineHeight: "1.5",
		margin: "20px 0 0",
		textAlign: "center" as const,
	},
	footer: {
		padding: "24px 36px",
		backgroundColor: "oklch(0.95 0 0)",
		borderTop: "1px solid oklch(0.88 0 0)",
		textAlign: "center" as const,
	},
	copyright: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)",
		margin: "0 0 12px",
	},
	footerLinks: {
		display: "flex",
		justifyContent: "center" as const,
		flexWrap: "wrap" as const,
	},
	link: {
		color: "oklch(0.44 0.04 44.87)",
		textDecoration: "none",
		fontSize: "14px",
		margin: "0 4px",
	},
	divider: {
		color: "oklch(0.88 0 0)",
		margin: "0 6px",
		fontSize: "14px",
	},
	"@media only screen and (max-width: 600px)": {
		body: { padding: "16px 12px" },
		container: { borderRadius: "calc(0.3rem - 4px)" },
		mainContent: { padding: "24px 20px" },
		heading: { fontSize: "24px" },
		contentCard: { padding: "20px" },
		button: { width: "100%", padding: "14px 20px" },
		securitySection: { padding: "16px" },
		footer: { padding: "20px" },
	},
} as const

export default OrgInvitationTemplate