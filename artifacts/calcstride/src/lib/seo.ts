import { localCategories, publishedToolCount, publishedTools } from './catalog';
import { getConstructionTool } from './construction';
import { percentageChangeContent } from './percentage-change';
import { dateDurationContent } from './date-duration';
import { financeCalculatorContent, isFinanceCalculatorSlug } from './finance-calculators';
import { isWorkDateCalculatorSlug, workDateCalculatorContent } from './work-date-calculators';
import { converterCalculatorContent, isConverterCalculatorSlug } from './converter-calculators';
import { businessCalculatorContent, isBusinessCalculatorSlug } from './business-calculators';
import { automotiveCalculatorContent, isAutomotiveCalculatorSlug } from './automotive-calculators';
import { concreteCalculatorContent, isConcreteCalculatorSlug } from './concrete-calculators';
import { isPriorityFinanceSlug, priorityFinanceContent } from './priority-finance-calculators';
import { expandedCalculatorContent } from './expanded-calculator-content';
import { focusedConstructionContent } from './focused-construction-content';
import { isPriorityOneExpansionSlug, priorityOneExpansionDefinitions } from './priority-one-expansion';
import { phaseTwoDefinitions, phaseTwoSlugs } from './phase-two-expansion';
import { phaseThreeADefinitions, phaseThreeASlugs } from './phase-three-a';
import { phaseThreeBDefinitions, phaseThreeBSlugs } from './phase-three-b';
import { phaseThreeCDefinitions, phaseThreeCSlugs } from './phase-three-c';
import { phaseFourDefinitions, phaseFourSlugs } from './phase-four';
import { getCalculatorSeoCapability } from './seo-capabilities';
import { articles, getArticle } from './articles';
import { homepageFaqData } from './homepage-content';
import { categoryContent } from './category-content';
import { fileToolDefinitions, isFileToolSlug } from './file-tools-catalog';
import { renderAdSenseHead } from './adsense';
import { breadcrumbListSchema, getBreadcrumbItems } from './breadcrumbs';
import {
  normalizeRoutePath,
  SITE_ORIGIN,
  toCanonicalUrl,
  toPublicPath,
} from './public-url';

export const SITE_NAME = 'FigureNest';
export const SITE_TAGLINE = 'Calculate. Convert. Figure It Out.';
export const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/social/figurenest-social-card.png`;
export const SOCIAL_IMAGE_ALT = 'FigureNest — free practical calculators and converters';
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const ORGANIZATION_LOGO_ID = `${SITE_ORIGIN}/#logo`;
export { SITE_ORIGIN };

export type SeoRecord = {
  path: string;
  title: string;
  description: string;
  h1: string;
  canonical: string;
  robots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  schema: object;
  status: 200 | 404;
  redirect?: string;
};

export const isPrivateSeoPath = (path: string) => (
  /^\/(?:sign-in|sign-up)(?:\/|$)/.test(path)
  || /^\/control-center(?:\/|$)/.test(path)
);

const TRUST_UPDATED_DATE = '2026-09-01';
const ARTICLE_INDEX_UPDATED_DATE = articles.map((article) => article.modified).sort().at(-1) ?? '2026-09-01';
const staticPages: Record<string, { title: string; description: string; h1: string; dateModified?: string }> = {
  '/': {
    title: 'Free Online Calculators & Converters | FigureNest',
    description: `Use ${publishedToolCount} free online calculators and converters across ${localCategories.length} practical categories, with clear inputs, formulas, guidance, and no sign-up.`,
    h1: 'Figure it out faster.',
  },
  '/articles': {
    title: 'Practical Calculator Guides | FigureNest',
    description: 'Read practical guides for finance, construction, work, vehicles, business, and unit conversions with clear formulas, examples, and limitations.',
    h1: 'Understand the numbers behind the tools.',
    dateModified: ARTICLE_INDEX_UPDATED_DATE,
  },
  '/calculators': {
    title: 'All Calculators & Converters | FigureNest',
    description: 'Search and browse every published FigureNest calculator, converter, estimator, and planning tool by category or name.',
    h1: 'All calculators and converters.',
  },
  '/home-construction': {
    title: 'Home & Construction Calculators | FigureNest',
    description: 'Plan concrete, paint, tile, flooring, roofing, landscaping, timber, fencing, drywall, and brick projects with free practical tools.',
    h1: 'Plan the work before the work.',
  },
  '/about': {
    title: 'About FigureNest Calculators & Converters',
    description: 'Learn how FigureNest creates focused calculators, converters, and practical guides with clear inputs, useful context, and transparent methods.',
    h1: 'About FigureNest',
    dateModified: TRUST_UPDATED_DATE,
  },
  '/contact': {
    title: 'Contact FigureNest About a Calculator or Bug',
    description: 'Send FigureNest a general question, calculator correction, bug report, privacy request, or suggestion through our secure contact form.',
    h1: 'Contact FigureNest',
    dateModified: TRUST_UPDATED_DATE,
  },
  '/privacy': {
    title: 'FigureNest Privacy Policy for Site Visitors',
    description: 'Learn what FigureNest processes, how calculator inputs stay in your browser, and how analytics, advertising, consent, and privacy requests work.',
    h1: 'Privacy Policy',
    dateModified: TRUST_UPDATED_DATE,
  },
  '/cookies': {
    title: 'FigureNest Cookie & Browser Storage Policy',
    description: 'Learn how FigureNest uses essential preference storage, consent-controlled Google Analytics, and separate advertising privacy choices.',
    h1: 'Cookie Policy',
    dateModified: TRUST_UPDATED_DATE,
  },
  '/terms': {
    title: 'FigureNest Terms for Calculators & Converters',
    description: 'Read the rules and responsibilities that apply when using FigureNest calculators, converters, estimates, guides, and educational information.',
    h1: 'Terms of Use',
    dateModified: TRUST_UPDATED_DATE,
  },
  '/disclaimer': {
    title: 'FigureNest Calculator & Estimate Disclaimer',
    description: 'Understand the limits of FigureNest calculations and estimates, and when to verify financial, construction, automotive, or personal decisions.',
    h1: 'Calculator Disclaimer',
    dateModified: TRUST_UPDATED_DATE,
  },
  '/methodology': {
    title: 'Calculator Methodology | FigureNest',
    description: 'Learn how FigureNest designs, checks, corrects, and explains calculator and converter results, assumptions, and practical limitations.',
    h1: 'Editorial & Calculator Methodology',
    dateModified: TRUST_UPDATED_DATE,
  },
};

const conciseDescription = (value: string) => value.length <= 160
  ? value
  : `${value.slice(0, 159).replace(/\s+\S*$/, '').replace(/[,:;—-]+$/, '')}.`;

const categoryMetadata: Record<string, { title: string; description: string }> = {
  finance: { title: 'Money & Finance Calculators | FigureNest', description: 'Compare loan payments, interest, mortgage payoff, budgets, retirement, savings, tax, and investment scenarios with clear planning tools.' },
  'salary-work': { title: 'Salary & Work Calculators | FigureNest', description: 'Calculate salary, overtime, age, and working days with free work and date tools that explain inputs, assumptions, and practical results.' },
  business: { title: 'Business & Pricing Calculators | FigureNest', description: 'Explore free ROI, profit margin, markup, break-even, and VAT calculators for clearer pricing, performance, and planning decisions.' },
  electrical: { title: 'Electrical Calculators | FigureNest', description: 'Estimate voltage drop and other circuit values with free electrical calculators that explain formulas, units, assumptions, and safety limits.' },
  technology: { title: 'Technology Tools & Calculators | FigureNest', description: 'Use local network, encoding, bandwidth, and password utilities with explicit validation, clear privacy boundaries, and practical technical guidance.' },
  'science-engineering': { title: 'Science & Engineering Calculators | FigureNest', description: 'Calculate density, mass, molarity, weather measures, speed, and horsepower with clear formulas, units, examples, and practical limits.' },
  math: { title: 'Everyday Math Calculators | FigureNest', description: 'Solve percentages, area, volume, and other everyday math questions with free calculators that show clear inputs and practical results.' },
  converters: { title: 'Unit & Measurement Converters | FigureNest', description: 'Convert length, weight, temperature, speed, power, and common units with free tools that keep measurement systems clear and consistent.' },
  'date-time': { title: 'Date & Time Calculators | FigureNest', description: 'Calculate age, date differences, and working days with free date and time tools designed for clear calendar-based planning.' },
  'printing-design': { title: 'Printing & Design Calculators | FigureNest', description: 'Calculate DPI, PPI, image dimensions, scaling, and pixels-to-centimetres for practical print preparation and digital design work.' },
  health: { title: 'Health & Fitness Calculators | FigureNest', description: 'Use BMI, body fat, calorie, pregnancy, pace, and sleep calculators with transparent methods and clear safety limitations.' },
  education: { title: 'Education Calculators | FigureNest', description: 'Calculate points-earned course percentages and weighted GPA with free academic tools that show the arithmetic and grading-scale limits.' },
  'file-tools': { title: 'Free PDF & File Tools | Private Browser Processing | FigureNest', description: 'Edit and sign PDFs with free FigureNest file tools designed to keep document content in your browser instead of sending files to a conversion server.' },
};

const breadcrumb = (items: { name: string; path: string }[]) => breadcrumbListSchema(
  getBreadcrumbItems(items.at(-1)?.path ?? '/'),
);

const graphSchema = (nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  legalName: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  description: 'FigureNest publishes free practical calculators, converters, estimators, and educational guides.',
  logo: {
    '@type': 'ImageObject',
    '@id': ORGANIZATION_LOGO_ID,
    url: `${SITE_ORIGIN}/pwa-512.png`,
    contentUrl: `${SITE_ORIGIN}/pwa-512.png`,
    width: 512,
    height: 512,
    caption: 'FigureNest logo',
  },
  image: {
    '@type': 'ImageObject',
    '@id': `${SITE_ORIGIN}/#social-image`,
    url: SOCIAL_IMAGE_URL,
    contentUrl: SOCIAL_IMAGE_URL,
    width: 1200,
    height: 630,
    caption: SOCIAL_IMAGE_ALT,
  },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: toCanonicalUrl('/contact') },
});

export const publicRouteKeys = [
  '/',
  '/calculators',
  '/home-construction',
  ...localCategories.filter((category) => category.slug !== 'construction').map((category) => `/category/${category.slug}`),
  ...publishedTools.map((tool) => tool.href),
  '/articles',
  ...articles.map((article) => `/articles/${article.slug}`),
  '/about',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/disclaimer',
  '/methodology',
];
export const publicRoutes = publicRouteKeys.map(toPublicPath);

export function getSeoForPath(inputPath: string): SeoRecord {
  const path = normalizeRoutePath(inputPath);
  if (path === '/category/construction') {
    const target = '/home-construction';
    const page = staticPages[target];
    return {
      ...page,
      path,
      canonical: toCanonicalUrl(target),
      robots: 'noindex, nofollow',
      schema: {},
      status: 200,
      redirect: toPublicPath(target),
    };
  }

  const staticPage = staticPages[path];
  if (staticPage) {
    const schema = path === '/'
      ? graphSchema([
          organizationSchema(),
          {
            '@type': 'WebSite',
            '@id': WEBSITE_ID,
            name: SITE_NAME,
            url: `${SITE_ORIGIN}/`,
            description: staticPage.description,
            inLanguage: 'en',
            publisher: { '@id': ORGANIZATION_ID },
          },
          {
            '@type': 'WebPage',
            name: staticPage.h1,
            url: toCanonicalUrl(path),
            description: staticPage.description,
            isPartOf: { '@id': WEBSITE_ID },
          },
          {
            '@type': 'FAQPage',
            mainEntity: homepageFaqData.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          },
        ])
      : path === '/articles'
      ? graphSchema([
          {
            '@type': 'CollectionPage',
            name: staticPage.h1,
            url: toCanonicalUrl(path),
            description: staticPage.description,
            dateModified: staticPage.dateModified,
            hasPart: articles.map((article) => ({
              '@type': 'Article',
              headline: article.h1,
              url: toCanonicalUrl(`/articles/${article.slug}`),
            })),
          },
          breadcrumb([
            { name: SITE_NAME, path: '/' },
            { name: 'Articles', path },
          ]),
        ])
      : graphSchema([
          {
            '@type': 'WebPage',
            name: staticPage.h1,
            url: toCanonicalUrl(path),
            description: staticPage.description,
            isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_ORIGIN}/` },
            ...(staticPage.dateModified ? { dateModified: staticPage.dateModified } : {}),
          },
          breadcrumb([
            { name: SITE_NAME, path: '/' },
            { name: staticPage.h1, path },
          ]),
        ]);
    return { ...staticPage, path, canonical: toCanonicalUrl(path), robots: 'index, follow', schema, status: 200 };
  }

  const article = path.startsWith('/articles/') ? getArticle(path.slice('/articles/'.length)) : undefined;
  if (article) {
    const articlePath = `/articles/${article.slug}`;
    return {
      path,
      title: article.seoTitle,
      description: article.metaDescription,
      h1: article.h1,
      canonical: toCanonicalUrl(articlePath),
      robots: 'index, follow',
      status: 200,
      schema: graphSchema([
        organizationSchema(),
        {
          '@type': 'Article',
          '@id': `${toCanonicalUrl(articlePath)}#article`,
          headline: article.h1,
          name: article.title,
          description: article.metaDescription,
          url: toCanonicalUrl(articlePath),
          mainEntityOfPage: toCanonicalUrl(articlePath),
          datePublished: article.published,
          dateModified: article.modified,
          inLanguage: 'en',
          image: {
            '@type': 'ImageObject',
            url: SOCIAL_IMAGE_URL,
            width: 1200,
            height: 630,
            caption: SOCIAL_IMAGE_ALT,
          },
          author: { '@id': ORGANIZATION_ID },
          publisher: { '@id': ORGANIZATION_ID },
        },
        breadcrumb([
          { name: SITE_NAME, path: '/' },
          { name: 'Articles', path: '/articles' },
          { name: article.title, path: articlePath },
        ]),
        {
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        },
      ]),
    };
  }

  const category = localCategories.find((item) => path === `/category/${item.slug}` && item.slug !== 'construction');
  if (category) {
    const override = categoryMetadata[category.slug];
    const description = override?.description ?? `${category.description} Explore ${category.toolCount} free ${category.name.toLowerCase()} tools from FigureNest.`;
    const title = override?.title ?? `${category.name} Calculators | FigureNest`;
    const content = categoryContent[category.slug as keyof typeof categoryContent];
    return {
      path,
      title,
      description,
      h1: category.name,
      canonical: toCanonicalUrl(path),
      robots: 'index, follow',
      status: 200,
      schema: graphSchema([
        { '@type': 'CollectionPage', name: category.name, url: toCanonicalUrl(path), description },
        breadcrumb([{ name: SITE_NAME, path: '/' }, { name: category.name, path }]),
        ...(content?.faqs.length ? [{
          '@type': 'FAQPage',
          mainEntity: content.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }] : []),
      ]),
    };
  }

  const tool = publishedTools.find((item) => item.href === path);
  if (tool) {
    const construction = getConstructionTool(tool.slug);
    const fileTool = isFileToolSlug(tool.slug) ? fileToolDefinitions[tool.slug] : undefined;
    const isPercentageChange = tool.slug === 'percentage-increase-decrease';
    const isDateDuration = tool.slug === 'date-difference';
    const financeContent = isFinanceCalculatorSlug(tool.slug) ? financeCalculatorContent[tool.slug] : undefined;
    const workDateContent = isWorkDateCalculatorSlug(tool.slug) ? workDateCalculatorContent[tool.slug] : undefined;
    const converterContent = isConverterCalculatorSlug(tool.slug) ? converterCalculatorContent[tool.slug] : undefined;
    const businessContent = isBusinessCalculatorSlug(tool.slug) ? businessCalculatorContent[tool.slug] : undefined;
    const automotiveContent = isAutomotiveCalculatorSlug(tool.slug) ? automotiveCalculatorContent[tool.slug] : undefined;
    const concreteContent = isConcreteCalculatorSlug(tool.slug) ? concreteCalculatorContent[tool.slug] : undefined;
    const priorityFinance = isPriorityFinanceSlug(tool.slug) ? priorityFinanceContent[tool.slug] : undefined;
    const priorityOneExpansion = isPriorityOneExpansionSlug(tool.slug) ? priorityOneExpansionDefinitions[tool.slug] : undefined;
    const phaseTwoSlug = phaseTwoSlugs.find((slug) => slug === tool.slug);
    const phaseTwoExpansion = phaseTwoSlug ? phaseTwoDefinitions[phaseTwoSlug] : undefined;
    const phaseThreeASlug = phaseThreeASlugs.find((slug) => slug === tool.slug);
    const phaseThreeAExpansion = phaseThreeASlug ? phaseThreeADefinitions[phaseThreeASlug] : undefined;
    const phaseThreeBSlug = phaseThreeBSlugs.find((slug) => slug === tool.slug);
    const phaseThreeBExpansion = phaseThreeBSlug ? phaseThreeBDefinitions[phaseThreeBSlug] : undefined;
    const phaseThreeCSlug = phaseThreeCSlugs.find((slug) => slug === tool.slug);
    const phaseThreeCExpansion = phaseThreeCSlug ? phaseThreeCDefinitions[phaseThreeCSlug] : undefined;
    const phaseFourSlug = phaseFourSlugs.find((slug) => slug === tool.slug);
    const phaseFourExpansion = phaseFourSlug ? phaseFourDefinitions[phaseFourSlug] : undefined;
    const expandedGuide = tool.slug in expandedCalculatorContent
      ? expandedCalculatorContent[tool.slug as keyof typeof expandedCalculatorContent]
      : undefined;
    const focusedConstructionGuide = tool.slug in focusedConstructionContent
      ? focusedConstructionContent[tool.slug as keyof typeof focusedConstructionContent]
      : undefined;
    const educationalGuide = expandedGuide ?? focusedConstructionGuide;
    const capability = getCalculatorSeoCapability(tool.slug);
    const description = fileTool ? fileTool.seoDescription : phaseFourExpansion ? phaseFourExpansion.seoDescription : phaseThreeCExpansion
      ? phaseThreeCExpansion.seoDescription
      : phaseThreeBExpansion
      ? phaseThreeBExpansion.seoDescription
      : phaseThreeAExpansion
      ? phaseThreeAExpansion.seoDescription
      : phaseTwoExpansion
      ? phaseTwoExpansion.seoDescription
      : priorityOneExpansion
      ? priorityOneExpansion.seoDescription
      : priorityFinance
      ? priorityFinance.seoDescription
      : concreteContent
      ? concreteContent.seoDescription
      : automotiveContent
      ? automotiveContent.seoDescription
      : businessContent
      ? businessContent.seoDescription
      : converterContent
      ? converterContent.seoDescription
      : workDateContent
      ? workDateContent.seoDescription
      : financeContent
      ? financeContent.seoDescription
      : isDateDuration
      ? 'Calculate the exact duration between two calendar dates in years, months, weeks, and days, with clear handling for reversed dates and leap years.'
      : isPercentageChange
      ? 'Calculate percentage increase or decrease, percentage difference, and reverse percentages with formulas and clear breakdowns.'
      : conciseDescription(construction
          ? `${construction.description} See the formula, worked example, instructions, and material planning tips.`
          : `${tool.description} Calculate, convert, and figure it out with FigureNest.`);
    const categoryPath = tool.categorySlug === 'construction' ? '/home-construction' : `/category/${tool.categorySlug}`;
    const nodes: object[] = [
      {
        '@type': 'WebApplication',
        name: fileTool?.h1 ?? phaseFourExpansion?.h1 ?? phaseThreeCExpansion?.h1 ?? phaseThreeBExpansion?.h1 ?? phaseThreeAExpansion?.h1 ?? phaseTwoExpansion?.h1 ?? priorityFinance?.title ?? concreteContent?.title ?? tool.name,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        url: toCanonicalUrl(path),
        description,
        provider: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_ORIGIN}/` },
      },
      breadcrumb([
        { name: SITE_NAME, path: '/' },
        { name: tool.category, path: categoryPath },
         { name: fileTool?.h1 ?? phaseFourExpansion?.h1 ?? phaseThreeCExpansion?.h1 ?? phaseThreeBExpansion?.h1 ?? phaseThreeAExpansion?.h1 ?? phaseTwoExpansion?.h1 ?? priorityFinance?.title ?? concreteContent?.title ?? tool.name, path },
      ]),
    ];
    if (concreteContent) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: concreteContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    } else if (construction?.faqs.length) {
      const visibleFaqs = [...construction.faqs, ...(educationalGuide?.faqs ?? [])];
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: visibleFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (isPercentageChange) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: percentageChangeContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (isDateDuration) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: dateDurationContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (financeContent) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: financeContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (workDateContent) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: workDateContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (converterContent) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: converterContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (businessContent) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: businessContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (automotiveContent) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: automotiveContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (priorityFinance) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: priorityFinance.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (priorityOneExpansion && !phaseThreeCExpansion) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: priorityOneExpansion.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (phaseTwoExpansion) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: phaseTwoExpansion.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (phaseThreeAExpansion) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: phaseThreeAExpansion.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (phaseThreeBExpansion) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: phaseThreeBExpansion.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (phaseThreeCExpansion) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: phaseThreeCExpansion.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    if (phaseFourExpansion) {
      nodes.push({ '@type': 'FAQPage', mainEntity: phaseFourExpansion.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) });
    }
    if (fileTool) {
      nodes.push({ '@type': 'FAQPage', mainEntity: fileTool.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) });
    }
    const hasSpecializedFaq = Boolean(
      concreteContent
      || construction?.faqs.length
      || isPercentageChange
      || isDateDuration
      || financeContent
      || workDateContent
      || converterContent
      || businessContent
      || automotiveContent
      || priorityFinance
      || priorityOneExpansion
      || phaseTwoExpansion
      || phaseThreeAExpansion
      || phaseThreeBExpansion
       || phaseThreeCExpansion || phaseFourExpansion || fileTool,
    );
    if (!hasSpecializedFaq && educationalGuide?.faqs.length) {
      nodes.push({
        '@type': 'FAQPage',
        mainEntity: educationalGuide.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    return {
      path,
      title: fileTool?.seoTitle ?? phaseFourExpansion?.seoTitle ?? phaseThreeCExpansion?.seoTitle ?? capability?.seoTitle ?? phaseThreeBExpansion?.seoTitle ?? phaseThreeAExpansion?.seoTitle ?? phaseTwoExpansion?.seoTitle ?? (priorityOneExpansion ? `${priorityOneExpansion.name} | FigureNest` : priorityFinance?.seoTitle ?? (concreteContent
        ? concreteContent.seoTitle
        : automotiveContent
        ? automotiveContent.seoTitle
        : businessContent
        ? businessContent.seoTitle
        : converterContent
        ? converterContent.seoTitle
        : workDateContent
        ? workDateContent.seoTitle
        : financeContent
        ? financeContent.seoTitle
        : isPercentageChange
        ? 'Percentage Change Calculator | FigureNest'
        : isDateDuration
          ? 'Date Duration Calculator | FigureNest'
           : `${tool.name} | FigureNest`)),
      description: fileTool?.seoDescription ?? phaseFourExpansion?.seoDescription ?? phaseThreeCExpansion?.seoDescription ?? capability?.seoDescription ?? phaseThreeBExpansion?.seoDescription ?? phaseThreeAExpansion?.seoDescription ?? phaseTwoExpansion?.seoDescription ?? priorityFinance?.seoDescription ?? description,
      h1: fileTool?.h1 ?? phaseFourExpansion?.h1 ?? phaseThreeCExpansion?.h1 ?? phaseThreeBExpansion?.h1 ?? phaseThreeAExpansion?.h1 ?? phaseTwoExpansion?.h1 ?? priorityOneExpansion?.name ?? priorityFinance?.title ?? concreteContent?.title ?? tool.name,
      canonical: toCanonicalUrl(path),
      robots: 'index, follow',
      status: 200,
      schema: graphSchema(nodes),
    };
  }

  if (isPrivateSeoPath(path)) {
    const isControlCenter = path === '/control-center' || path.startsWith('/control-center/');
    const isSignIn = path === '/sign-in' || path.startsWith('/sign-in/');
    const title = isControlCenter
      ? 'FigureNest Control Center'
      : isSignIn
        ? 'Sign In | FigureNest'
        : 'Sign Up | FigureNest';
    const description = isControlCenter
      ? 'Private FigureNest operations console.'
      : 'Private FigureNest account access.';
    return {
      path,
      title,
      description,
      h1: isControlCenter ? 'FigureNest Control Center' : isSignIn ? 'Sign In' : 'Sign Up',
      canonical: toCanonicalUrl(path),
      robots: 'noindex, nofollow',
      status: 200,
      schema: graphSchema([{ '@type': 'WebPage', name: title, url: toCanonicalUrl(path) }]),
    };
  }

  const description = 'The requested FigureNest page could not be found. Browse the practical toolkit to find a working calculator or converter.';
  return {
    path,
    title: 'Page Not Found | FigureNest',
    description,
    h1: 'Not found.',
    canonical: toCanonicalUrl(path),
    robots: 'noindex, follow',
    status: 404,
    schema: graphSchema([
      { '@type': 'WebPage', name: 'Page Not Found', url: toCanonicalUrl(path) },
      breadcrumbListSchema(getBreadcrumbItems(path)),
    ]),
  };
}

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export function renderSeoHead(seo: SeoRecord) {
  const json = JSON.stringify(seo.schema).replaceAll('<', '\\u003c');
  const tags = [
    `<script id="figurenest-disable-umami">try{localStorage.setItem('umami.disabled','1')}catch(e){}</script>`,
    `<title>${escapeAttribute(seo.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(seo.description)}" />`,
    `<meta name="robots" content="${seo.robots}" />`,
    `<link rel="canonical" href="${escapeAttribute(seo.canonical)}" />`,
    `<meta property="og:title" content="${escapeAttribute(seo.title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(seo.description)}" />`,
    `<meta property="og:type" content="${seo.path.startsWith('/articles/') && seo.status === 200 ? 'article' : 'website'}" />`,
    `<meta property="og:url" content="${escapeAttribute(seo.canonical)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:image" content="${SOCIAL_IMAGE_URL}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escapeAttribute(SOCIAL_IMAGE_ALT)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeAttribute(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(seo.description)}" />`,
    `<meta name="twitter:image" content="${SOCIAL_IMAGE_URL}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttribute(SOCIAL_IMAGE_ALT)}" />`,
    `<script id="figurenest-structured-data" type="application/ld+json">${json}</script>`,
  ];
  if (seo.robots === 'index, follow') {
    tags.push(
      `<script id="figurenest-google-consent-default">window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});</script>`,
      renderAdSenseHead(),
    );
  }
  return tags.join('\n    ');
}