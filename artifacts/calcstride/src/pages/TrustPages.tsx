import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, MessageSquareText } from 'lucide-react';
import { Link } from '@/components/PublicLink';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import '@/trust-pages.css';

export type TrustPageKind = 'about' | 'contact' | 'privacy' | 'cookies' | 'terms' | 'disclaimer' | 'methodology';

const UPDATED = 'September 1, 2026';
const UPDATED_ISO = '2026-09-01';

type Section = { heading: string; body: ReactNode };
type Page = { label: string; title: string; intro: string; sections: Section[] };

const contactLink = (label = 'contact form') => <Link href="/contact">{label}</Link>;

const pages: Record<TrustPageKind, Page> = {
  about: {
    label: 'About',
    title: 'About FigureNest',
    intro: 'FigureNest publishes practical calculators and converters for everyday estimates, planning, and comparisons.',
    sections: [
      { heading: 'What we make', body: <>Our tools cover common questions about money, work, home projects, vehicles, measurements, dates, and printing. A result is most useful when its inputs and limits are understandable, so we aim to keep the task focused instead of hiding it behind unnecessary steps.</> },
      { heading: 'How to use the site', body: <>Start with the calculator or converter that matches your question, enter values that reflect your situation, and review the result alongside its units and assumptions. For a look at how the tools are checked and what they cannot tell you, read our <Link href="/methodology">editorial and calculator methodology</Link>.</> },
      { heading: 'Who operates the site', body: <>FigureNest is the publisher and operator of this independent calculator website. The <Link href="/contact">contact form</Link> is our public support channel for questions, corrections, privacy requests, and tool suggestions. It is not an emergency or professional-advice service.</> },
      { heading: 'Feedback and corrections', body: <>We welcome reports of unclear wording, broken tools, or suspected calculation errors. Please include the page, inputs, expected result if known, and a short explanation through our {contactLink()}. We review reports and correct confirmed issues when appropriate.</> },
    ],
  },
  contact: {
    label: 'Contact',
    title: 'Contact FigureNest',
    intro: 'Use the contact form to send FigureNest a question, correction, bug report, privacy request, or calculator idea.',
    sections: [
      { heading: 'General questions and tool feedback', body: <>Use the form below for general feedback. To help us reproduce a calculator issue, include the page link, values entered, units selected, result shown, and the result you expected.</> },
      { heading: 'Privacy requests', body: <>Choose Privacy request for questions or requests concerning personal information. Please do not send financial account numbers, government IDs, passwords, or other sensitive information.</> },
      { heading: 'Corrections process', body: <>We assess correction requests against the displayed formula, source inputs, and applicable tool instructions. If an error is confirmed, we update the affected content or calculation and may clarify the page’s assumptions. We cannot promise a particular response time or outcome.</> },
      { heading: 'What happens after submission', body: <>Messages are queued for review through this form. Include enough detail for us to reproduce the issue, but do not use the form for urgent help or send sensitive records. We may not reply to every suggestion, and the form does not create a professional or advisory relationship.</> },
    ],
  },
  privacy: {
    label: 'Privacy',
    title: 'Privacy Policy',
    intro: 'This policy explains the limited information FigureNest may process and the choices available to visitors.',
    sections: [
      { heading: 'Information and calculator inputs', body: <>Public calculators do not require an account. Values entered into a calculator are used in your browser to produce its result; do not enter sensitive personal, financial, medical, or confidential information. We may receive routine technical and usage information needed to operate, secure, and understand the site, such as browser or device details, pages visited, and interactions with site features.</> },
      { heading: 'Google Analytics 4', body: <>Only after you select Accept analytics, FigureNest loads Google Analytics 4 (measurement ID G-DXVBC2FNSS) on figurenest.com or www.figurenest.com public, indexable pages. Google may set analytics cookies and receive canonical page URLs, browser and device information, approximate location derived from IP address, and privacy-safe interaction events. We use this information to understand page and calculator use and improve FigureNest. We do not send calculator inputs, calculated values, search text, form contents, email addresses, or other direct identifiers. Analytics consent is separate from advertising consent.</> },
      { heading: 'Google AdSense and Auto ads', body: <>FigureNest uses Google AdSense publisher ca-pub-8048023190382309 to verify the site and support Auto ads on public, indexable pages of figurenest.com and www.figurenest.com. The AdSense tag does not load on preview, development, Replit, fallback, private, sign-in, control-center, error, or other noindex pages. Google may process page context, ad interactions, browser and device information, and IP addresses for basic ad delivery, security, fraud prevention, measurement, and—only when the required permission is available—personalization. Non-personalized ads can still use cookies for functions such as frequency capping, aggregated reporting, and fraud prevention. Limited ads do not use personal data for ad personalization, but ad code and creatives are still delivered and cached, IP addresses are still used for basic delivery, and limited invalid-traffic storage may be used where permitted.</> },
      { heading: 'Advertising consent and regional messages', body: <>Advertising storage, advertising user data, and ad personalization default to denied under Google Consent Mode v2. Where consent rules apply in the EEA, the UK, or Switzerland, advertising choices must be presented through a Google-certified consent management platform configured for FigureNest. The FigureNest analytics banner is not a certified CMP and does not grant advertising consent. The certified CMP controls advertising purposes independently and provides the applicable privacy choices and revocation entry point.</> },
      { heading: 'Consent, retention, and withdrawal', body: <>Your analytics choice is stored in local storage and the figurenest_consent cookie for up to 180 days, then expires and is requested again. Google Analytics and AdSense data are handled under Google’s terms, privacy policy, and account retention settings. FigureNest configures analytics without Google signals or ad-personalization signals. Use Privacy / Cookie preferences in the footer to change analytics consent. Use the Google-certified advertising privacy message or its revocation link to change advertising choices where available. Browser controls can also clear or block cookies and local storage.</> },
      { heading: 'Your rights and policy updates', body: <>Depending on where you live, you may have rights to request access, correction, deletion, restriction, objection, or information about personal data processing. Submit a privacy request through the {contactLink()} on the Contact page. We may need to verify a request and may be unable to honor it where an exception applies. We may revise this policy when site practices change; the updated date tells you when this version took effect.</> },
    ],
  },
  cookies: {
    label: 'Cookies',
    title: 'Cookie Policy',
    intro: 'FigureNest uses essential preference storage, consent-controlled Google Analytics, and Google AdSense with separate advertising choices.',
    sections: [
      { heading: 'Essential preference storage', body: <>The figurenest_consent cookie and matching figurenest-consent-v1 local-storage record store whether you accepted analytics and their expiration time. They expire after no more than 180 days. They are necessary to remember and apply your choice; declining analytics does not prevent calculator use.</> },
      { heading: 'Optional Google Analytics cookies', body: <>After you accept analytics, Google Analytics 4 (measurement ID G-DXVBC2FNSS) may set cookies whose names begin with _ga, including _ga and a property-specific _ga_ cookie. They distinguish visits and measure public page views and allowlisted interactions. FigureNest does not send query strings, URL fragments, calculator inputs or results, search text, form contents, or direct identifiers.</> },
      { heading: 'Google AdSense storage', body: <>Google AdSense publisher ca-pub-8048023190382309 supports site verification and Auto ads. Advertising purposes are separate from analytics. Google may use cookies or local storage for personalized ads only when the required permission is available. Non-personalized ads can still use storage for frequency capping, aggregated reporting, and fraud prevention. Limited ads disable personal-data use for personalization but still deliver and cache ad technology and creatives, use IP addresses for basic delivery, and may use limited invalid-traffic storage where permitted.</> },
      { heading: 'Certified advertising consent', body: <>Advertising storage, advertising user data, and ad personalization default to denied. For visitors in the EEA, the UK, or Switzerland where consent rules apply, FigureNest requires a Google-certified CMP to present advertising choices and provide a revocation entry point. The FigureNest analytics banner is not a certified CMP and controls analytics only.</> },
      { heading: 'Where Google services run', body: <>Google Analytics and AdSense load only on the exact production hosts figurenest.com and www.figurenest.com and only on public, indexable routes. Neither service loads on other hosts, preview or development deployments, private account routes, error pages, or other noindex routes.</> },
      { heading: 'Manage your choices', body: <>Use Privacy / Cookie preferences in the footer to accept or reject analytics at any time. Withdrawing analytics consent stops further analytics collection and clears accessible _ga cookies. Use the Google-certified advertising message or its revocation link to change advertising choices where available. You can also clear or block browser storage. See the <Link href="/privacy">Privacy Policy</Link> and <Link href="/contact">Contact page</Link> for more information.</> },
    ],
  },
  terms: {
    label: 'Terms',
    title: 'Terms of Use',
    intro: 'These terms describe the basic rules for using FigureNest’s public calculators, converters, and information.',
    sections: [
      { heading: 'Using FigureNest', body: <>You may use the public site for lawful, personal, educational, or business planning purposes. Do not interfere with the service, attempt to bypass access controls, misuse automated access, or use the site in a way that harms others or violates applicable law.</> },
      { heading: 'Content and availability', body: <>FigureNest provides general information and estimates, not individualized professional advice. We may change, correct, remove, or discontinue content or features. We do not guarantee that the service will be available, uninterrupted, error-free, or suitable for every purpose.</> },
      { heading: 'Your decisions', body: <>You are responsible for checking inputs, assumptions, units, and results before relying on them. Review the <Link href="/disclaimer">Disclaimer</Link> and <Link href="/methodology">methodology</Link> before using a result for a material decision.</> },
      { heading: 'Contact', body: <>Submit questions about these terms through the public {contactLink()}.</> },
    ],
  },
  disclaimer: {
    label: 'Disclaimer',
    title: 'Calculator Disclaimer',
    intro: 'FigureNest calculators provide general estimates and educational information, not professional advice or guaranteed outcomes.',
    sections: [
      { heading: 'Estimates have limits', body: <>A result depends on the values, formula, rounding, units, and assumptions used by a tool. Taxes, fees, rates, local rules, material waste, site conditions, product specifications, and real-world timing can materially change an outcome.</> },
      { heading: 'Verify important decisions', body: <>Use results as a starting point and verify them with current documents, measurements, quotes, codes, or an appropriate qualified professional when the stakes are high. FigureNest does not provide financial, legal, tax, medical, engineering, construction, automotive, or other professional advice.</> },
      { heading: 'No promise of results', body: <>We do not guarantee accuracy, completeness, availability, savings, eligibility, compliance, or any particular outcome. See the <Link href="/methodology">methodology</Link> for calculator quality checks and known limitations, or report a suspected error through our {contactLink()}.</> },
    ],
  },
  methodology: {
    label: 'Methodology',
    title: 'Editorial & Calculator Methodology',
    intro: 'How FigureNest explains, checks, updates, and limits its practical calculator and converter content.',
    sections: [
      { heading: 'Tool design and sources', body: <>Each tool begins with a defined question, input units, and a formula or conversion relationship suitable for a general estimate. We write explanatory content to identify the inputs and assumptions a visitor should consider. Rates, prices, regulations, and local requirements are not treated as universal facts unless they are supplied by the visitor.</> },
      { heading: 'Units, currencies, and display choices', body: <>Changing a unit, currency symbol, or measurement system should change how inputs and results are entered or displayed without changing the underlying relationship. A currency selector does not perform an exchange-rate conversion unless the tool explicitly says that it does. Visitors should confirm that every displayed unit matches the values they intend to use.</> },
      { heading: 'Calculator quality checks', body: <>Before publishing or revising a calculator, we review the formula against representative hand calculations, test ordinary and boundary inputs, check unit conversions and rounding, and confirm that labels and result formatting match the underlying calculation. These checks reduce avoidable errors; they do not make a calculator appropriate for every circumstance.</> },
      { heading: 'Editorial review and corrections', body: <>We review pages for clarity, consistency with the displayed tool, and meaningful limitations. When a visitor reports a possible problem, we reproduce the issue where possible, compare the result with the stated method, and correct confirmed errors or unclear instructions. Submit correction reports through the {contactLink()} and include the page and inputs used.</> },
      { heading: 'Limitations and updates', body: <>Tools may simplify real conditions, use rounded outputs, or omit factors outside their stated inputs. A calculator may change when its formula, explanation, or usability needs correction. The date shown on this page is the date this methodology was last updated; it does not certify every result or guarantee ongoing accuracy.</> },
    ],
  },
};

type ContactFields = {
  name: string;
  email: string;
  reason: string;
  pageUrl: string;
  message: string;
  website: string;
};

const emptyContact: ContactFields = { name: '', email: '', reason: '', pageUrl: '', message: '', website: '' };

function ContactForm() {
  const [fields, setFields] = useState(emptyContact);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFields, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'failure'>('idle');
  const [failure, setFailure] = useState('');
  const startedAt = useRef(Date.now());

  const validate = () => {
    const next: Partial<Record<keyof ContactFields, string>> = {};
    if (fields.name.trim().length < 2) next.name = 'Enter your name using at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = 'Enter a valid email address.';
    if (!fields.reason) next.reason = 'Choose a contact reason.';
    if (fields.pageUrl && !/^https?:\/\/\S+$/i.test(fields.pageUrl)) next.pageUrl = 'Enter a complete URL beginning with http:// or https://.';
    if (fields.message.trim().length < 20) next.message = 'Enter a message using at least 20 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure('');
    if (!validate()) {
      setStatus('idle');
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, startedAt: startedAt.current }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Your message could not be sent. Please try again.');
      setStatus('success');
      setFields(emptyContact);
    } catch (error) {
      setStatus('failure');
      setFailure(error instanceof Error ? error.message : 'Your message could not be sent. Please try again.');
    }
  };

  if (status === 'success') return <section className="contact-success" role="status" tabIndex={-1}>
    <CheckCircle2 aria-hidden="true" />
    <h2>Message received.</h2>
    <p>Thank you. Your message has been stored securely for the FigureNest team to review.</p>
    <button className="primary-button" type="button" onClick={() => { setStatus('idle'); startedAt.current = Date.now(); }}>Send another message</button>
  </section>;

  const update = (name: keyof ContactFields, value: string) => {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const fieldError = (name: keyof ContactFields) => errors[name] ? `${name}-error` : undefined;

  return <div className="contact-form-wrap">
    <form onSubmit={submit} noValidate aria-describedby="contact-sensitive-warning">
      <div className="contact-field">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" autoComplete="name" value={fields.name} onChange={(e) => update('name', e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={fieldError('name')} maxLength={100} />
        {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" value={fields.email} onChange={(e) => update('email', e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={fieldError('email')} maxLength={254} />
        {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-reason">Contact reason</label>
        <select id="contact-reason" name="reason" autoComplete="off" value={fields.reason} onChange={(e) => update('reason', e.target.value)} aria-invalid={Boolean(errors.reason)} aria-describedby={fieldError('reason')}>
          <option value="">Choose a reason</option>
          <option>General question</option><option>Calculator correction</option><option>Bug report</option><option>Privacy request</option><option>Calculator suggestion</option>
        </select>
        {errors.reason && <span className="field-error" id="reason-error">{errors.reason}</span>}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-page-url">Page URL involved <span>Optional</span></label>
        <input id="contact-page-url" name="pageUrl" type="url" inputMode="url" autoComplete="url" placeholder="https://figurenest.com/…" value={fields.pageUrl} onChange={(e) => update('pageUrl', e.target.value)} aria-invalid={Boolean(errors.pageUrl)} aria-describedby={fieldError('pageUrl')} maxLength={500} />
        {errors.pageUrl && <span className="field-error" id="pageUrl-error">{errors.pageUrl}</span>}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={7} value={fields.message} onChange={(e) => update('message', e.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={fieldError('message')} maxLength={5000} />
        {errors.message && <span className="field-error" id="message-error">{errors.message}</span>}
      </div>
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field blank</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(e) => update('website', e.target.value)} />
      </div>
      <p className="contact-warning" id="contact-sensitive-warning">Do not submit passwords, financial account numbers, government IDs, or other sensitive information.</p>
      {status === 'failure' && <p className="form-failure" role="alert">{failure}</p>}
      <button className="primary-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Submit message'}</button>
    </form>
    <aside className="contact-aside"><MessageSquareText aria-hidden="true" /><strong>Helpful details</strong><p>For calculator corrections, include the page, inputs, units, result shown, and the result you expected.</p><small>Quiet spam checks protect this form without requiring a difficult CAPTCHA.</small></aside>
  </div>;
}

export function TrustPage({ kind }: { kind: TrustPageKind }) {
  const page = pages[kind];
  return <Shell>
    <Seo path={`/${kind}`} />
    <section className="page-intro legal-intro">
      <div className="eyebrow">FIGURENEST / {page.label.toUpperCase()}</div>
      <h1>{page.title}</h1>
      <p>{page.intro}</p>
      {kind !== 'contact' && <p className="mono">EFFECTIVE AND LAST UPDATED: <time dateTime={UPDATED_ISO}>{UPDATED.toUpperCase()}</time></p>}
    </section>
    {kind === 'contact' ? <ContactForm /> : <article className="legal-article">
      {page.sections.map((section, index) => <section key={section.heading}>
        <span className="mono">{String(index + 1).padStart(2, '0')}</span>
        <div><h2>{section.heading}</h2><p>{section.body}</p></div>
      </section>)}
    </article>}
    <nav className="legal-article" aria-label="FigureNest trust pages">
      <section><span className="mono">↗</span><div><h2>Related trust pages</h2><p><Link href="/about">About</Link> · <Link href="/contact">Contact</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/cookies">Cookies</Link> · <Link href="/terms">Terms</Link> · <Link href="/disclaimer">Disclaimer</Link> · <Link href="/methodology">Methodology</Link></p></div></section>
    </nav>
  </Shell>;
}