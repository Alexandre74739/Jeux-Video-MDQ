import { PUBLISHER, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Données structurées (schema.org) : décrit le site comme une application éducative gratuite. */
export default function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "fr",
    isAccessibleForFree: true,
    typicalAgeRange: "6-10",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    author: { "@type": "Person", name: PUBLISHER.name },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
