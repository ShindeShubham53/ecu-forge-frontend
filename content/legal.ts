/**
 * ECU FORGE public legal content — single source of truth for /privacy, /terms and /refund-policy
 * (and the business details used by /delete-account).
 *
 * OWNER ACTION REQUIRED
 *  1. Replace every LEGAL value that starts with "TODO".
 *  2. Resolve every item in OWNER_DECISIONS (bottom of this file), especially those marked launchBlocker.
 *  3. Have the final wording reviewed by a qualified lawyer. This content is not certified as legally compliant.
 * While any TODO remains, every policy page shows a "Draft — pending owner review" banner.
 *
 * Wording is original. Every factual statement reflects the current implementation
 * (backend/prisma/schema.prisma, backend/src, frontend, mobile) as of the "lastUpdated" date.
 *
 * Inline syntax used in policy text:  **bold**   [label](/path)   {{legalKey}}
 */

// ---------------------------------------------------------------------------------------------------------------
// Business details
// ---------------------------------------------------------------------------------------------------------------
export const LEGAL = {
  brand: 'ECU FORGE MASTERCLASS',
  poweredBy: 'MECH-MOTO',
  websiteUrl: 'https://ecu-forge-frontend.vercel.app',
  lastUpdated: '11 October 2026',

  operatorLegalName: 'TODO: registered legal name of the MECH-MOTO business entity that operates ECU FORGE',
  postalAddress: 'TODO: registered business address',
  supportEmail: 'TODO: support email address',
  privacyEmail: 'TODO: privacy contact email address (may be the same as the support email)',
  grievanceOfficer: 'TODO: grievance officer name, designation and email',
  jurisdiction: 'TODO: city and state whose courts will have jurisdiction',
  effectiveDate: 'TODO: effective date',

  // LAUNCH BLOCKER: the platform does not collect age/date of birth and has no parent/guardian consent workflow.
  parentalConsentProcess:
    'TODO: how a parent or guardian gives, and ECU FORGE verifies, consent for a minor (no such process exists in the platform yet)',

  paymentRecordRetention: 'TODO: retention period for payment and tax records required by applicable law',

  // Approved: aim to initiate approved refunds within 7–10 business days after approval.
  refundInitiationTime: '7–10 business days',
} as const;

export type LegalKey = keyof typeof LEGAL;

export const isTodo = (value: string): boolean => value.trim().startsWith('TODO');

/** True while any business/legal detail still needs the owner's input. */
export const hasPendingLegalTodos = (): boolean => Object.values(LEGAL).some((v) => isTodo(v));

// ---------------------------------------------------------------------------------------------------------------
// Policy content model
// ---------------------------------------------------------------------------------------------------------------
export type PolicyBlock =
  | string // paragraph
  | { h3: string } // sub-heading
  | { list: string[] } // bullet list
  | { note: string } // highlighted information
  | { proposed: string }; // wording that is NOT in effect until the owner approves it

export interface PolicySection {
  id: string;
  title: string;
  blocks: PolicyBlock[];
}

export interface PolicyDocument {
  slug: '/privacy' | '/terms' | '/refund-policy';
  title: string;
  summary: string;
  sections: PolicySection[];
}

// ---------------------------------------------------------------------------------------------------------------
// Privacy Policy
// ---------------------------------------------------------------------------------------------------------------
export const PRIVACY_POLICY: PolicyDocument = {
  slug: '/privacy',
  title: 'Privacy Policy',
  summary:
    'How ECU FORGE MASTERCLASS collects, uses, shares and protects your information when you use our website and mobile app.',
  sections: [
    {
      id: 'introduction',
      title: '1. Introduction',
      blocks: [
        'ECU FORGE MASTERCLASS ("ECU FORGE", "we", "us") is an online automotive technical learning platform operated by MECH-MOTO ({{operatorLegalName}}). We provide online courses, recorded video lessons, downloadable learning resources, quizzes, learning-progress tracking and certificates of completion.',
        'This Privacy Policy explains what information we collect, why we collect it, who we share it with and the choices you have. It applies to the ECU FORGE website ([ecu-forge-frontend.vercel.app](/)) and the ECU FORGE mobile learner app. The same account works on both.',
        'By creating an account or using ECU FORGE, you acknowledge that your information will be handled as described here.',
      ],
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect',
      blocks: [
        'We collect only the information needed to run your account and your learning. We do not ask for or store more than this.',
        { h3: 'Account information' },
        {
          list: [
            '**Name and email address** that you provide when you register.',
            '**Password**, which we never store in readable form. Only a one-way encrypted (bcrypt) version is kept, so our team cannot see your password.',
            '**Account details** such as your account type (learner or administrator), account status and the dates your account was created and last updated.',
            '**Sign-in session**: after you sign in we issue a session token that stays valid for up to 7 days. On the website it is kept in your browser\'s local storage; in the mobile app it is kept in your device\'s secure storage.',
            'We do not currently collect a profile photo, phone number, address, age or date of birth.',
          ],
        },
        { h3: 'Learning information' },
        {
          list: [
            '**Course enrollments**: which courses you are enrolled in, when you enrolled, your overall course progress and whether you have completed the course.',
            '**Lecture progress**: for each lecture, your last playback position (so you can resume), how much of it you have watched, the watch time our server has verified, and whether you have completed it.',
            '**Quiz results**: for each attempt, your score, percentage, whether you passed and when you attempted it. We do not store the individual answers you select.',
            '**Certificates**: the name printed on the certificate, the course title, a unique certificate ID, the issue date and whether the certificate is valid.',
          ],
        },
        { h3: 'Payment information' },
        {
          list: [
            'Payments are processed by **Razorpay** through Razorpay Checkout. You enter your card, UPI, net-banking or wallet details directly with Razorpay.',
            'We store a record of each purchase: the course purchased, the Razorpay order ID and payment ID, the amount, the currency, the payment status and the date.',
            'To pre-fill the checkout form, we pass your name and email address to Razorpay, along with internal reference numbers for your account and the course.',
            'ECU FORGE does **not** receive or store your card number, CVV, UPI PIN, OTP or banking passwords.',
          ],
        },
        { h3: 'Technical information' },
        {
          list: [
            'Your **IP address** is used briefly by our server to protect sign-in, registration and account deletion from repeated automated attempts. It is not saved in our database.',
            'Our hosting providers keep standard request logs (which may include IP address and browser or app details) to operate and secure their services, under their own policies.',
            'Our server records technical events such as errors, which may include internal account reference numbers. We never record passwords.',
          ],
        },
        { h3: 'Information stored only on your device (mobile app)' },
        {
          list: [
            'A list of the courses you recently opened, used to order your "Recently Accessed" courses.',
            'Copies of lecture PDFs that you choose to open. You can remove these at any time from Profile → Preferences → Clear downloads.',
          ],
        },
        { h3: 'What we do not collect' },
        'We do not use advertising or analytics trackers, and we do not use cookies to track you. We do not collect your location, contacts, photos or other files from your device.',
      ],
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Information',
      blocks: [
        'We use your information to:',
        {
          list: [
            'create, secure and manage your learner account;',
            'sign you in and keep you signed in securely;',
            'give you access to the free and paid courses you are enrolled in, stream lectures and provide learning resources;',
            'save your learning progress and keep it in sync between the website and the mobile app;',
            'evaluate quizzes and determine whether you meet the requirements for a certificate;',
            'issue, display and allow verification of certificates;',
            'process, verify and reconcile purchases, and handle refund and payment-problem requests;',
            'respond to your support, privacy and account requests;',
            'detect and prevent unauthorised access, fraud and misuse of the platform;',
            'keep the platform reliable, fix problems and improve our courses and services; and',
            'meet our legal, accounting and tax obligations.',
          ],
        },
        'We do not sell your personal information, and we do not use it for advertising.',
      ],
    },
    {
      id: 'service-providers',
      title: '4. Third-Party Service Providers',
      blocks: [
        'We use trusted service providers to run ECU FORGE. They handle information only as needed to provide their service to us and under their own privacy policies:',
        {
          list: [
            '**Razorpay** — payment processing. Receives your payment details directly, plus the checkout information described above.',
            '**Mux** — video delivery. When you play a lecture, your device connects to Mux to stream the video through a time-limited secure link.',
            '**Neon (PostgreSQL)** — hosting of our application database, which stores your account, learning and purchase records.',
            '**Cloudflare R2** — private storage for course learning resources (PDFs), delivered through short-lived download links.',
            '**Vercel** — hosting of the ECU FORGE website.',
            '**Render** — hosting of the ECU FORGE application server (API).',
          ],
        },
        'Our website also loads fonts from Google Fonts and some course images from Unsplash, so your browser connects to these services directly when it displays those pages.',
        'Some of these providers process data on servers outside India. Our application database is currently hosted in the United States.',
        { h3: 'Certificate verification' },
        'Each certificate has a unique certificate ID. Anyone who has that ID can verify the certificate on our website and will see the name on the certificate, the course title, the issue date and whether it is valid. Please share your certificate ID only with people you want to be able to verify it.',
        { h3: 'Legal requirements' },
        'We may disclose information if required by law, court order or a government authority, or where necessary to protect the rights, safety and security of our learners, our platform or the public.',
      ],
    },
    {
      id: 'security',
      title: '5. Data Security',
      blocks: [
        'We use reasonable technical and organisational measures to protect your information, including:',
        {
          list: [
            'HTTPS encryption for our production website and API;',
            'passwords stored only in one-way encrypted form;',
            'authenticated, protected APIs, where our server checks your account and course access on every request;',
            'time-limited links for video playback and private storage with expiring links for learning resources; and',
            'administrative access restricted to authorised team members.',
          ],
        },
        'No method of storing or transmitting information over the internet is completely secure, so we cannot guarantee absolute security. Please keep your password private and contact us if you suspect unauthorised use of your account.',
      ],
    },
    {
      id: 'retention',
      title: '6. Data Retention',
      blocks: [
        'We keep your information for as long as it is needed to operate your account and deliver your courses, to keep proper business records, to resolve disputes and to meet our legal obligations.',
        'Purchase and payment records are kept for {{paymentRecordRetention}}. When you delete your account, the information described in the next section is removed or anonymised.',
      ],
    },
    {
      id: 'account-deletion',
      title: '7. Account Deletion',
      blocks: [
        'You can delete your account yourself at any time:',
        {
          list: [
            '**Mobile app**: Profile → Account → Delete account (you confirm with your password).',
            '**Website**: visit [Delete Your Account](/delete-account), sign in and follow the steps.',
          ],
        },
        'When you delete your account:',
        {
          list: [
            'your name, email address and password are removed from your account record, the account is anonymised and it can no longer be used to sign in;',
            'your lecture progress and quiz results are deleted;',
            'certificate records are kept in anonymised form — your name is removed and the certificate is marked as no longer valid; and',
            'purchase and enrollment records are kept where necessary for accounting, tax, refunds and fraud prevention, without your name or email address.',
          ],
        },
        'Deletion takes effect immediately and cannot be undone. Because some records must be kept, deletion does not remove every record of a purchase. Razorpay keeps its own records of your payments under its policies.',
      ],
    },
    {
      id: 'your-rights',
      title: '8. Your Rights and Requests',
      blocks: [
        'Subject to applicable law, you may ask us to:',
        {
          list: [
            '**access** the personal information we hold about you;',
            '**correct** inaccurate information (for example, the name on your account — this cannot yet be edited in the app or website, so please contact us);',
            '**delete** your account (see section 7); and',
            '**withdraw** from using ECU FORGE at any time.',
          ],
        },
        'To make a request, email {{privacyEmail}} from the email address registered on your account so that we can verify it is you. We may need to keep certain information where the law requires it.',
      ],
    },
    {
      id: 'children',
      title: "9. Children's Privacy",
      blocks: [
        'ECU FORGE is designed for automotive learners and professionals. A person under 18 years of age (a "minor") may use ECU FORGE only where this is permitted by applicable law and with any consent from a parent or lawful guardian that the law requires. Where consent is required, it must be given before the minor creates an account or uses the Platform, and the parent or guardian is responsible for the minor\'s use of ECU FORGE.',
        'Our sign-up does not currently ask for your age or date of birth. Parent/guardian consent process: {{parentalConsentProcess}}.',
        'We use a minor\'s information only to provide their learning account, as described in this policy. We do not use it for advertising, tracking or behavioural monitoring.',
        'If you are a parent or guardian and believe a minor has created an account or shared information with us without the required consent, please contact us using the details in section 11. We will review the request and, where appropriate, delete the account as described in section 7.',
      ],
    },
    {
      id: 'changes',
      title: '10. Changes to This Privacy Policy',
      blocks: [
        'We may update this policy when our services, providers or legal requirements change. The updated version will be published on this page with a revised effective date. For significant changes, we will take reasonable steps to bring them to your attention.',
      ],
    },
    {
      id: 'contact',
      title: '11. Contact and Grievance Information',
      blocks: [
        'If you have questions or concerns about this policy or how your information is handled, please contact us using the details below. You can also raise a grievance with our grievance officer.',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Terms & Conditions
// ---------------------------------------------------------------------------------------------------------------
export const TERMS: PolicyDocument = {
  slug: '/terms',
  title: 'Terms & Conditions',
  summary: 'The rules for using ECU FORGE MASTERCLASS, buying courses and earning certificates.',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      blocks: [
        'These Terms & Conditions ("Terms") apply to your use of the ECU FORGE MASTERCLASS website and mobile app (the "Platform"), operated by MECH-MOTO ({{operatorLegalName}}).',
        'Please read these Terms, our [Privacy Policy](/privacy) and our [Refund Policy](/refund-policy) before creating an account or buying a course. By using the Platform, you agree to follow them. If you do not agree, please do not use the Platform.',
      ],
    },
    {
      id: 'about',
      title: '2. About ECU FORGE',
      blocks: [
        'ECU FORGE is an online automotive technical education service. It offers recorded video lessons, downloadable technical learning resources, assessments (quizzes) and certificates of completion, covering topics such as ECU diagnostics, automotive electronics and vehicle electrical systems.',
      ],
    },
    {
      id: 'eligibility',
      title: '3. Eligibility',
      blocks: [
        'To use the Platform you must provide accurate, complete account information and be able to enter into a binding agreement under the laws that apply to you.',
        'If you are under 18 years of age, you may use the Platform only where applicable law permits it and with any consent from your parent or lawful guardian that the law requires. In that case, your parent or guardian must review and accept these Terms on your behalf and is responsible for your use of the Platform, including any purchase. Parent/guardian consent process: {{parentalConsentProcess}}. See also our [Privacy Policy](/privacy).',
      ],
    },
    {
      id: 'accounts',
      title: '4. User Accounts',
      blocks: [
        {
          list: [
            'Provide your real name and a valid email address that you control.',
            'Keep your password and signed-in devices safe. Do not share your account or sign-in details with anyone.',
            'You are responsible for activity on your account. Contact us promptly if you think someone else has accessed it.',
            'Do not use the Platform to gain unauthorised access to other accounts, data or systems.',
            'You can delete your account at any time through the app or the [Delete Your Account](/delete-account) page.',
          ],
        },
      ],
    },
    {
      id: 'courses',
      title: '5. Courses and Enrollment',
      blocks: [
        {
          list: [
            'ECU FORGE offers both free and paid courses.',
            'Before you enroll, the course page shows the course details, price, modules and lectures.',
            'Free courses become available as soon as you enroll.',
            'Paid courses become available only after your payment has been successfully verified by our server and your enrollment has been created.',
            'Course access is personal to your account and cannot be transferred or shared.',
          ],
        },
        { h3: 'Lifetime course access' },
        'Unless a course page clearly states a different access period before you buy, a course you enroll in does not expire: you can keep accessing it online through your ECU FORGE account, on the website and in the mobile app, for as long as your account remains active and the Platform is operated.',
        '"Lifetime access" is a licence to use the course through the Platform. It does not give you ownership of the course content, and it does not include a right to download lecture videos or to use course content offline, other than learning resources that we specifically make available for download.',
        'We will not withdraw access to a course you have validly enrolled in except where you delete your account, where the payment for that course is refunded, reversed or charged back, where your account is suspended or deactivated under section 15, or where we are required to do so by law. Changes to course content and to the availability of the Platform are covered in section 14.',
      ],
    },
    {
      id: 'content-licence',
      title: '6. Course Content and Learning Resources',
      blocks: [
        'All course materials — including video lessons, PDFs, quizzes and other resources — are licensed to you, not sold. When you enroll, you receive a limited, personal, non-exclusive, non-transferable licence to view and use them for your own learning.',
        'Unless the law expressly permits it, you must not copy, download (other than learning resources we make available for download), screen-record for redistribution, share, resell, publish or commercially exploit any course material.',
      ],
    },
    {
      id: 'payments',
      title: '7. Payments',
      blocks: [
        {
          list: [
            'Course prices are shown in Indian Rupees (INR) on the course page and at checkout.',
            'Payments are processed securely by Razorpay on the ECU FORGE website, including purchases you start from the mobile app.',
            'Your enrollment is created only after our server has successfully verified the payment.',
            'A failed, cancelled or incomplete payment does not give access to the course.',
            'If you were charged but your course did not unlock, please follow the steps in our [Refund Policy](/refund-policy).',
          ],
        },
      ],
    },
    {
      id: 'refunds',
      title: '8. Refunds and Cancellations',
      blocks: ['Refunds and cancellations are handled under our [Refund Policy](/refund-policy), which forms part of these Terms.'],
    },
    {
      id: 'progress',
      title: '9. Learning Progress and Assessments',
      blocks: [
        'The Platform records your lecture completion, watch progress and quiz results. These are used to show your progress and to determine whether you are eligible for a certificate. Lecture completion is confirmed by our server based on actual viewing, so skipping to the end of a video does not mark it complete.',
        'Quizzes are graded automatically. You can retake a quiz if you do not pass it.',
      ],
    },
    {
      id: 'certificates',
      title: '10. Certificates',
      blocks: [
        {
          list: [
            'To earn a certificate, you must complete all lectures in the course.',
            'If the course includes a qualifying quiz, you must also pass it. If the course has no quiz, completing all lectures meets the requirement.',
            'Certificates are issued automatically once the requirements are met, and each one has a unique certificate ID that others can use to verify it.',
            'A certificate confirms that you completed the ECU FORGE course requirements. It is not a government-recognised qualification, an accreditation, a professional licence or a guarantee of employment.',
            'We may revoke a certificate obtained through misuse or fraud, for a refunded course, or when the account is deleted.',
          ],
        },
      ],
    },
    {
      id: 'safety',
      title: '11. Technical Training Disclaimer',
      blocks: [
        'Automotive diagnostics, ECU programming and calibration, high-voltage systems and vehicle repair can involve serious mechanical, electrical, fire and personal-safety risks, and may be regulated by law.',
        'Our courses are for education only. They do not replace the vehicle manufacturer\'s instructions, qualified supervision, proper tools and protective equipment, or applicable safety and legal requirements. Watching a course does not mean you can safely carry out every procedure shown. Always assess your own skills and work safely and lawfully.',
      ],
    },
    {
      id: 'ip',
      title: '12. Intellectual Property',
      blocks: [
        'The ECU FORGE and MECH-MOTO names and logos, the Platform, and all course content — including videos, documents, quizzes, certificates and designs — are owned by or licensed to the operator and are protected by intellectual-property laws. Other trademarks belong to their respective owners. Nothing in these Terms transfers ownership to you.',
      ],
    },
    {
      id: 'prohibited',
      title: '13. Prohibited Activities',
      blocks: [
        'You must not:',
        {
          list: [
            'share, upload, resell or otherwise redistribute paid course content;',
            'attempt to bypass, disable or interfere with course access restrictions or payment verification;',
            'access or attempt to access other users\' accounts, our systems or data without permission;',
            'make fraudulent payments or misuse refund or payment-dispute processes;',
            'misuse certificates, including presenting another person\'s certificate as your own; or',
            'use the Platform for any unlawful purpose or in a way that harms other learners or the Platform.',
          ],
        },
      ],
    },
    {
      id: 'availability',
      title: '14. Availability and Changes',
      blocks: [
        'We work to keep the Platform available, but there may be interruptions for maintenance, updates or reasons outside our control.',
        'We may update, correct or improve course content and features over time. If we make a change that significantly reduces the content of a paid course you have bought, we will act reasonably — for example, by offering suitable replacement content or a fair remedy under our Refund Policy.',
        'Lifetime course access is not a promise that the Platform, or any individual course, will be operated forever. If we ever decide to discontinue a paid course or the Platform, we will give reasonable advance notice where practicable and act reasonably towards learners who paid for affected courses, without limiting any rights you have under applicable law.',
      ],
    },
    {
      id: 'suspension',
      title: '15. Account Suspension and Deletion',
      blocks: [
        'We may suspend or deactivate an account that breaks these Terms, is used for fraud or abuse, or puts other learners or the Platform at risk. A deactivated account cannot sign in. Where appropriate and lawful, we will tell you the reason and give you an opportunity to respond.',
        'You may stop using the Platform and delete your account at any time, as described in our [Privacy Policy](/privacy).',
      ],
    },
    {
      id: 'liability',
      title: '16. Disclaimer and Limitation of Liability',
      blocks: [
        'We provide the Platform and its courses with reasonable care and skill. Except as stated in these Terms, the Platform is provided on an "as available" basis. We do not guarantee any particular learning outcome, exam or job result, income or business result from taking a course.',
        'To the extent permitted by law, we are not responsible for indirect or consequential losses, or for damage resulting from applying course content to a vehicle or system, and our total liability for any claim relating to a course is limited to the amount you paid for that course.',
        'Nothing in these Terms excludes or limits any liability or consumer right that cannot be excluded or limited under applicable law.',
      ],
    },
    {
      id: 'law',
      title: '17. Governing Law and Disputes',
      blocks: [
        'These Terms are governed by the laws of India. We encourage you to contact us first so that we can try to resolve any concern informally. Subject to applicable law, the courts at {{jurisdiction}} will have jurisdiction over disputes relating to these Terms.',
      ],
    },
    {
      id: 'contact',
      title: '18. Contact Information',
      blocks: ['For questions about these Terms, please contact us using the details below.'],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Refund & Cancellation Policy
// ---------------------------------------------------------------------------------------------------------------
export const REFUND_POLICY: PolicyDocument = {
  slug: '/refund-policy',
  title: 'Refund & Cancellation Policy',
  summary: 'How cancellations, refunds and payment problems are handled for ECU FORGE course purchases.',
  sections: [
    {
      id: 'digital',
      title: '1. Digital Course Purchases',
      blocks: [
        'ECU FORGE courses are digital educational content. Nothing is shipped: when our server verifies your payment, the course is added to your ECU FORGE account straight away and you can start learning on the website and in the mobile app. All payments are processed by Razorpay.',
        'Course access is described in our [Terms & Conditions](/terms) (section 5).',
      ],
    },
    {
      id: 'cancellation',
      title: '2. Cancellation and Change of Mind',
      blocks: [
        'Because a digital course is delivered as soon as payment is verified, **we do not offer cancellations or refunds for a change of mind once access to a paid course has been granted to your account** — for example, because you no longer need the course, did not use it, or chose a different course. This is subject to applicable law.',
        'This does not affect:',
        {
          list: [
            'payments that succeeded but did not unlock the course (section 3);',
            'duplicate charges for the same course (section 4);',
            'failed or pending transactions (section 5);',
            'the remedy described in section 14 of our [Terms & Conditions](/terms) if a paid course is significantly reduced or discontinued; or',
            'any refund or other remedy that you are entitled to under applicable law (section 9).',
          ],
        },
      ],
    },
    {
      id: 'not-unlocked',
      title: '3. Payment Successful but Course Not Unlocked',
      blocks: [
        'Occasionally a payment can succeed while the confirmation reaches us late. Please first refresh the course page or reopen the app. If the course is still locked, contact us at {{supportEmail}} with:',
        {
          list: [
            'your registered email address;',
            'the course name;',
            'your Razorpay payment ID or order ID (shown in your Razorpay payment confirmation); and',
            'a short description of the problem.',
          ],
        },
        'We will investigate and verify the transaction with Razorpay and our payment records. If the payment was successful, we will work to give you access to the course. If access cannot be provided, the amount paid for that course will be refunded as described in section 7.',
      ],
    },
    {
      id: 'duplicate',
      title: '4. Duplicate Payments',
      blocks: [
        'If you were charged more than once for the same course, please report it to {{supportEmail}} with the payment IDs. We will investigate and verify the charges with Razorpay. Where a duplicate successful charge is confirmed, the duplicate amount will be refunded as described in section 7; you keep access to the course through the original payment.',
      ],
    },
    {
      id: 'failed',
      title: '5. Failed or Pending Transactions',
      blocks: [
        'A payment that is not successfully captured does not create an enrollment and does not give access to the course.',
        'If money was deducted from your account for a failed or pending transaction, it is usually reversed by Razorpay or your bank. The time this takes depends on your bank or payment method. If the amount is not reversed, contact us with the payment details and we will help you check its status with Razorpay.',
      ],
    },
    {
      id: 'requests',
      title: '6. How to Request a Refund',
      blocks: [
        {
          list: [
            'Email {{supportEmail}} from the email address registered on your ECU FORGE account.',
            'Include the course name, your Razorpay payment or order ID, the payment date and the reason for your request.',
            'Never share your password, card number, CVV, UPI PIN or OTP. ECU FORGE will never ask for them.',
          ],
        },
        'Please contact us as soon as possible after you notice a problem, so that we can check the transaction while the records are fresh.',
        'Refund requests are reviewed manually by our support team. There is no automatic refund through the website or the app.',
      ],
    },
    {
      id: 'review',
      title: '7. Refund Review and Processing',
      blocks: [
        'Every request is checked against our payment records and with Razorpay, and decided according to this policy and applicable law. We will reply to the email address on your account with the outcome.',
        'If a refund is approved, **we aim to initiate it within {{refundInitiationTime}} after approval**. Refunds are made to the original payment method through Razorpay.',
        'After a refund is initiated, the time it takes for the money to appear in your account depends on Razorpay, your bank or card issuer and the payment system used. We cannot guarantee the date on which the refund will be credited.',
      ],
    },
    {
      id: 'access-after-refund',
      title: '8. Course Access After a Refund',
      blocks: [
        'If a refund is approved, access to the refunded course may be withdrawn, and any certificate issued for that course may be revoked. Access is updated by our team as part of processing the refund; it is not removed automatically. Your account and any other courses are not affected.',
      ],
    },
    {
      id: 'consumer-rights',
      title: '9. Your Consumer Rights',
      blocks: ['Nothing in this policy limits or excludes any rights you have under applicable consumer-protection law that cannot be limited or excluded.'],
    },
    {
      id: 'contact',
      title: '10. Contact',
      blocks: ['For refunds and payment problems, contact our support team using the details below. Please include the information listed in section 3 or 6 so we can help you quickly.'],
    },
  ],
};

export const POLICIES = [PRIVACY_POLICY, TERMS, REFUND_POLICY] as const;

// ---------------------------------------------------------------------------------------------------------------
// Unresolved owner decisions (not displayed publicly; kept here so nothing is forgotten before publishing)
// ---------------------------------------------------------------------------------------------------------------
//
// Approved by the owner (11 October 2026) and now reflected in the live wording:
//   - no change-of-mind refunds after access is granted, subject to law (Refund §2);
//   - duplicate charges and paid-but-not-unlocked payments are investigated (Refund §3–4);
//   - lifetime access unless the course page states otherwise before purchase; not ownership/offline rights (Terms §5, §14);
//   - minors only where permitted by law and with legally required parent/guardian consent (Privacy §9, Terms §3);
//   - approved refunds: aim to initiate within 7–10 business days after approval; no credit-date guarantee (Refund §7).
export const OWNER_DECISIONS: {
  key: LegalKey | 'parentalConsentControls' | 'termsAcceptanceAtSignup' | 'siteMarketingClaims';
  decision: string;
  usedIn: string;
  launchBlocker?: boolean;
}[] = [
  { key: 'operatorLegalName', decision: 'Registered legal name of the operating MECH-MOTO entity', usedIn: 'All policies' },
  { key: 'postalAddress', decision: 'Registered business address', usedIn: 'All policies (contact)' },
  { key: 'supportEmail', decision: 'Support email for help, refunds and deletion requests', usedIn: 'Refund, Terms, Delete Account' },
  { key: 'privacyEmail', decision: 'Privacy contact email', usedIn: 'Privacy' },
  { key: 'grievanceOfficer', decision: 'Grievance officer name, designation and email', usedIn: 'Privacy (contact)' },
  { key: 'jurisdiction', decision: 'City and state for court jurisdiction (governing law: India)', usedIn: 'Terms §17' },
  { key: 'effectiveDate', decision: 'Effective date of the policies', usedIn: 'All policies' },
  { key: 'paymentRecordRetention', decision: 'Retention period for payment/tax records', usedIn: 'Privacy §6, Delete Account' },
  {
    key: 'parentalConsentProcess',
    decision: 'Describe the parent/guardian consent process once it exists (legal review: whether verifiable consent is required for minors)',
    usedIn: 'Privacy §9, Terms §3',
    launchBlocker: true,
  },
  {
    key: 'parentalConsentControls',
    decision:
      'Not implemented: sign-up (web and mobile) collects no age/date of birth and there is no parent/guardian consent, verification or consent record. Build it or restrict sign-up to adults before launch if legal review requires it',
    usedIn: 'Product (backend, web and mobile sign-up)',
    launchBlocker: true,
  },
  {
    key: 'termsAcceptanceAtSignup',
    decision: 'Sign-up does not show or record acceptance of the Terms and Privacy Policy; consider adding links/acceptance at registration',
    usedIn: 'Product (web and mobile sign-up)',
  },
  {
    key: 'siteMarketingClaims',
    decision:
      'Existing site copy calls certificates "accredited" (home, course, learn, dashboard, verify pages, certificate and quiz modals); change it so it matches Terms §10 (not an accreditation)',
    usedIn: 'Website marketing copy',
  },
];
