/**
 * Client testimonials, shown by <TestimonialGroup> on the home page and the
 * SEO Helpline page. The group renders nothing while this list is empty, so
 * add real quotes only, with the person's permission, worded as they said
 * them. Never invent or paraphrase a quote.
 *
 * Example entry:
 *   {
 *     quote: 'Josh found the tracking gap in one call…',
 *     name: 'Jane Doe',
 *     role: 'Marketing Director, Example Co.',
 *     photo: '/assets/img/testimonials/jane-doe.jpg', // optional, square
 *   },
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** Job title and company, e.g. "Marketing Director, Example Co." */
  role?: string;
  /** Square photo path. Without one, the person's initials are shown. */
  photo?: string;
}

export const testimonials: Testimonial[] = [];
