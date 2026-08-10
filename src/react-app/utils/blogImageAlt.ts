import { CountryData } from '@/shared/types';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const destinationTerms = [
  ...CountryData.countries.map((country) => ({ term: country, country })),
  ...Object.entries(CountryData.cities).flatMap(([country, cities]) =>
    cities.map((city) => ({ term: city, country })),
  ),
].sort((a, b) => b.term.length - a.term.length);

export function getBlogImageAlt(title: string, slug: string): string {
  const searchable = ` ${normalize(`${title} ${slug}`)} `;
  const destination = destinationTerms.find(({ term }) =>
    searchable.includes(` ${normalize(term)} `),
  );

  return destination
    ? `Leaving the US to ${destination.country}`
    : 'Information for leaving the US';
}

export function applyBlogImageAlt(html: string, altText: string): string {
  const escapedAlt = altText.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return html.replace(/<img\b[^>]*>/gi, (imageTag) => {
    if (/\salt\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i.test(imageTag)) {
      return imageTag.replace(
        /\salt\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i,
        ` alt="${escapedAlt}"`,
      );
    }

    return imageTag.replace(/^<img\b/i, `<img alt="${escapedAlt}"`);
  });
}
