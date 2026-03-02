import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies Policy",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Cookies Policy
          </h1>
          {/* <Link
            href="/signup"
            className="rounded-full border border-cyan-300/50 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-300/10"
          >
            Back to Sign Up
          </Link> */}
        </div>

        <p className="text-sm text-slate-300">
          Effective date: February 22, 2026
        </p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-200">
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              1. Cookies and Tracking Technologies
            </h2>
            <p>
              When you interact with the Survex Sites and Features, we use
              cookies and similar tracking technologies to ensure security,
              performance, fraud prevention, and proper functionality of our
              Services. Cookies are small text files stored on your computer or
              mobile device when you visit a website. We also use related
              technologies such as web beacons, pixels, SDKs (Software
              Development Kits), in-app identifiers, browser fingerprinting
              technologies, and device recognition tools. These technologies may
              also be used in automated fraud detection systems and risk-scoring
              models to assess account integrity and enforce platform rules.
              These technologies may collect technical and usage information
              including: IP address and IP history Device identifiers and device
              fingerprinting data Browser type and version Operating system
              Screen resolution and device characteristics Referrer URLs
              Interaction data within the platform Time spent on pages
              Participation and activity logs We use these technologies for the
              following purposes: Essential & Security Cookies These cookies are
              strictly necessary for the operation of the platform. They allow
              us to: Authenticate users Maintain session integrity Prevent
              fraudulent activity Detect duplicate accounts Identify VPNs,
              proxies, residential RDPs, emulators, automation tools, or
              artificial activity Protect Rewards Programs and partner
              requirements Without these technologies, Survex cannot securely
              operate. Performance & Analytics Cookies These cookies help us:
              Understand traffic behavior Monitor system performance Improve
              user experience Analyze usage trends Personalization Cookies These
              cookies allow us to: Customize content Improve promotional
              relevance Adapt interface design Some cookies are session-based
              and expire when you close your browser. Others are persistent
              cookies and remain on your device for a defined period. Blocking
              essential cookies may result in restricted access, inability to
              participate in surveys, or suspension of account activity due to
              failed verification.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              2. Third-Party Cookies and Technologies
            </h2>
            <p>
              Survex works with third-party service providers who may set
              cookies or similar tracking technologies on your device. These
              providers include: Survey and offerwall partners Fraud detection
              and compliance vendors Identity verification providers Analytics
              services Cloud infrastructure and security providers These third
              parties may collect technical data necessary to: Validate survey
              participation Detect suspicious or artificial behavior Prevent
              reward abuse Ensure compliance with partner requirements Monitor
              traffic anomalies We do not control third-party cookies directly,
              and their use is governed by their respective privacy policies. By
              participating in surveys or reward programs, you acknowledge that
              certain third-party tracking technologies are required to validate
              eligibility and prevent fraud. Blocking these technologies may
              result in: Disqualification from surveys Inability to earn rewards
              Account verification failures
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              3. Legal Basis and Consent
            </h2>
            <p>
              Where required by applicable law (including the California
              Consumer Privacy Act (CCPA/CPRA) and other U.S. state privacy
              laws), Survex will obtain your consent before placing
              non-essential cookies on your device. You may manage cookie
              preferences through: Your browser settings Device privacy settings
              Any cookie consent banner provided on our platform Please note
              that disabling certain tracking technologies may limit the
              functionality of Survex Services. Survex does not sell personal
              information obtained through cookies in exchange for monetary
              compensation. However, certain data sharing activities may qualify
              as &quot;sharing&quot; under California law for cross-context
              behavioral advertising. If you are a California resident and wish
              to exercise your right to opt-out of the “sale” or “sharing” of
              Personal Information as defined under California law, you may
              submit a request by contacting Support@survex.app with the subject
              line “Do Not Sell or Share Request.” We will process verified
              requests in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              4. Data Retention for Tracking Technologies
            </h2>
            <p>
              Information collected through cookies and tracking technologies
              may be retained for as long as necessary to: Maintain platform
              integrity Prevent fraud and abuse Resolve disputes Comply with
              legal obligations Enforce our Terms and Conditions Retention
              periods may vary depending on the nature of the data and
              regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              5. Policy Updates
            </h2>
            <p>
              The digital environment and tracking technologies evolve
              constantly. Survex reserves the right to update this Cookie Policy
              at any time to reflect: Changes in third-party integrations
              Updates to fraud prevention systems Legal or regulatory
              developments Improvements in service functionality Updates become
              effective immediately upon posting. Continued use of Survex Sites
              after changes are posted constitutes acceptance of the revised
              policy. Where legally required, we will provide notice of material
              changes affecting your rights.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">6. Contact Us</h2>
            <p>
              If you have questions about this Cookie Policy or wish to exercise
              any cookie-related rights, you may contact us at:
              Support@survex.app Subject: Cookie Policy Inquiry We may require
              verification of identity before processing certain requests.
            </p>
          </section>
        </div>
      </main>
      <div className="mx-auto w-full max-w-3xl">
        <SiteFooter />
      </div>
    </div>
  );
}
