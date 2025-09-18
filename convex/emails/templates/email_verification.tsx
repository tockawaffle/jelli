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
import { User } from "better-auth"
import dayjs from "dayjs"

interface EmailVerificationProps {
	url: string
	token: string
	user: User
}

export const EmailVerification = ({ url, token, user }: EmailVerificationProps) => {
	// Get user's profile image if available
	const profileImage =
		user.image ||
		"https://kf9653eimo.ufs.sh/f/JLwV8LM67suiZK8ap69z12uFvPBalx90RDhSAbJm4GrMkjdV"

	// Format the verification URL with token
	const verificationUrl = `${url}?token=${token}`

	return (
		<Html>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<Preview>Verify your email address for your Tocka's Nest account</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					{/* Header */}
					<Section style={styles.header}>
						<Row>
							<Column>
								<Img src={profileImage} alt="Logo" width="64" height="64" style={styles.logo} />
							</Column>
						</Row>
					</Section>

					{/* Main Content */}
					<Section style={styles.mainContent}>
						<Heading style={styles.heading}>Email Verification</Heading>
						<Text style={styles.subheading}>Please verify your email address</Text>

						<Section style={styles.contentCard}>
							<Text style={styles.greeting}>Hello {user.name},</Text>
							<Text style={styles.paragraph}>
								We received a request to verify your email address. Please click the button below to complete this
								process.
							</Text>

							{/* Verification Button */}
							<Section style={styles.buttonContainer}>
								<Button style={styles.button} href={verificationUrl}>
									Verify Email Address
								</Button>
							</Section>
						</Section>

						{/* Verification Token */}
						<Section style={styles.tokenSection}>
							<Text style={styles.tokenLabel}>If the button doesn't work, use this verification code:</Text>
							<div style={styles.tokenBox}>
								<Text style={styles.token}>{token}</Text>
							</div>
						</Section>

						{/* Security Notice */}
						<Section style={styles.securitySection}>
							<Row style={styles.securityHeader}>
								<Column width="30">
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
								</Column>
								<Column>
									<Text style={styles.securityTitle}>Security Information</Text>
								</Column>
							</Row>
							<ul style={styles.securityList}>
								<li style={styles.securityItem}>This link will expire in 24 hours</li>
								<li style={styles.securityItem}>
									If you didn't request this verification, please secure your account immediately
								</li>
								<li style={styles.securityItem}>
									After verification, your account will use this email address for all communications
								</li>
							</ul>
						</Section>

						<Text style={styles.noteText}>If you didn't request this email, please ignore and delete it.</Text>
					</Section>

					{/* Footer */}
					<Section style={styles.footer}>
						<Text style={styles.copyright}>© {dayjs().year()} Tocka's Nest. All rights reserved.</Text>
						<Row style={styles.footerLinks}>
							<Column align="center">
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
							</Column>
						</Row>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

// Styles strictly based on globals.css
const styles = {
	body: {
		backgroundColor: "#f9f9f9",
		fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'",
		margin: 0,
		padding: "24px",
		color: "#333333",
	},
	container: {
		width: "100%",
		maxWidth: "550px",
		margin: "0 auto",
		backgroundColor: "#ffffff",
		borderRadius: "8px",
		overflow: "hidden",
		border: "1px solid #e0e0e0",
	},
	header: {
		backgroundColor: "#5E50F9",
		padding: "32px 0",
		textAlign: "center" as const,
	},
	logo: {
		borderRadius: "50%",
		border: "2px solid #ffffff",
		margin: "0 auto",
		display: "block",
		backgroundColor: "#ffffff",
	},
	mainContent: {
		backgroundColor: "#ffffff",
		padding: "32px 36px",
		color: "#333333",
	},
	heading: {
		fontSize: "26px",
		fontWeight: "700",
		color: "#333333",
		textAlign: "center" as const,
		margin: "0 0 8px",
		lineHeight: "1.3",
		fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'",
	},
	subheading: {
		fontSize: "16px",
		color: "#808080",
		textAlign: "center" as const,
		margin: "0 0 28px",
		fontWeight: "400",
	},
	contentCard: {
		backgroundColor: "#f2f2f2",
		borderRadius: "8px",
		padding: "24px",
		marginBottom: "28px",
		border: "1px solid #e0e0e0",
	},
	greeting: {
		fontSize: "18px",
		fontWeight: "600",
		color: "#333333",
		margin: "0 0 16px",
		fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'",
	},
	paragraph: {
		fontSize: "16px",
		lineHeight: "1.6",
		color: "#333333",
		margin: "0 0 24px",
	},
	buttonContainer: {
		textAlign: "center" as const,
		margin: "24px 0 8px",
	},
	button: {
		backgroundColor: "#5E50F9",
		borderRadius: "8px",
		color: "#ffffff",
		fontSize: "16px",
		fontWeight: "600",
		textDecoration: "none",
		textAlign: "center" as const,
		display: "inline-block",
		padding: "12px 28px",
		border: "none",
	},
	tokenSection: {
		margin: "28px 0",
		textAlign: "center" as const,
	},
	tokenLabel: {
		fontSize: "14px",
		color: "#808080",
		marginBottom: "12px",
	},
	tokenBox: {
		backgroundColor: "#f2f2f2",
		borderRadius: "8px",
		padding: "16px",
		maxWidth: "100%",
		overflowX: "auto" as const,
		margin: "0 auto",
		display: "inline-block",
		border: "1px solid #e0e0e0",
	},
	token: {
		fontSize: "16px",
		fontFamily: "'Courier New', 'Courier', 'monospace'",
		fontWeight: "600",
		color: "#5E50F9",
		margin: "0",
		padding: 0,
		wordBreak: "break-all" as const,
		textAlign: "center" as const,
		lineHeight: "1.4",
		userSelect: "all" as const,
	},
	securitySection: {
		margin: "28px 0 24px",
		padding: "20px",
		backgroundColor: "#f2f2f2",
		borderRadius: "8px",
		border: "1px solid #e0e0e0",
	},
	securityHeader: {
		width: "100%",
	},
	securityIcon: {
		color: "#808080",
	},
	securityTitle: {
		fontSize: "16px",
		fontWeight: "600",
		color: "#333333",
		margin: "0",
		fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'",
	},
	securityList: {
		margin: "10px 0 0",
		paddingLeft: "20px",
	},
	securityItem: {
		fontSize: "14px",
		color: "#808080",
		margin: "0 0 8px",
		lineHeight: "1.5",
	},
	noteText: {
		fontSize: "14px",
		color: "#808080",
		fontStyle: "italic",
		lineHeight: "1.5",
		margin: "20px 0 0",
		textAlign: "center" as const,
	},
	footer: {
		padding: "24px 36px",
		backgroundColor: "#f9f9f9",
		borderTop: "1px solid #e0e0e0",
		textAlign: "center" as const,
	},
	copyright: {
		fontSize: "14px",
		color: "#808080",
		margin: "0 0 12px",
	},
	footerLinks: {
		width: "100%",
	},
	link: {
		color: "#5E50F9",
		textDecoration: "none",
		fontSize: "14px",
		margin: "0 4px",
	},
	divider: {
		color: "#e0e0e0",
		margin: "0 6px",
		fontSize: "14px",
	},
	"@media only screen and (max-width: 600px)": {
		body: {
			padding: "16px 12px",
		},
		container: {
			borderRadius: "4px",
		},
		mainContent: {
			padding: "24px 20px",
		},
		heading: {
			fontSize: "24px",
		},
		contentCard: {
			padding: "20px",
		},
		button: {
			width: "100%",
			padding: "14px 20px",
		},
		securitySection: {
			padding: "16px",
		},
		footer: {
			padding: "20px",
		},
		token: {
			fontSize: "14px",
		},
		tokenBox: {
			padding: "12px",
		},
	},
}

export default EmailVerification
export const html = async (user: User, url: string, token: string) => {
	return
}
