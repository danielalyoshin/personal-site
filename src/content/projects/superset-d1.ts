import type { Project } from '../types'
// Rendered from superset-d1-diagram.html by `npm run render:diagrams`.
import diagram from './media/superset-d1-diagram.webp'

export const supersetD1: Project = {
  slug: 'superset-d1',
  title: 'Cloudflare D1 in Apache Superset',
  tagline:
    'Maintaining the Cloudflare D1 support I helped build for Apache Superset.',
  description: [
    'In 2025 I was one of five people who built the packages that first connected Apache Superset, the open-source data visualization platform, to Cloudflare D1, a serverless SQLite database. Today I’m one of their maintainers.',
    'Those first releases only ran on SQLAlchemy 1.4 and Python 3.11. Superset 7.0 moves to SQLAlchemy 2, so D1 support was going to break. I rebuilt our dialect, sqlalchemy-d1, as a thin layer over sqlalchemy-cloudflare-d1, the maintained community dialect. Existing d1:// connections keep working, and our layer adds only what Superset needs, like date columns it recognizes as dates. I retired the other two packages, which leaves one small package to maintain instead of three.',
    'Version 0.2.0 went to PyPI on 21 September 2026, after tests against a real D1 database and a full check in a running Superset. My pull request to Superset switches its D1 install to the new version and asks for the fix in 7.0. It also fixes the D1 bugs that testing turned up. The worst made a date filter return the wrong days. I reported two bugs in the community driver to its maintainer.',
  ],
  year: 2026,
  role: 'Maintainer',
  tags: ['python', 'sqlalchemy', 'cloudflare-d1', 'apache-superset'],
  links: [
    { label: 'PyPI', url: 'https://pypi.org/project/sqlalchemy-d1/0.2.0/' },
    {
      label: 'Dialect PR',
      url: 'https://github.com/sqlalchemy-cf-d1/sqlalchemy-d1/pull/1',
    },
    {
      label: 'Superset PR',
      url: 'https://github.com/apache/superset/pull/44505',
    },
    { label: 'Packages', url: 'https://github.com/sqlalchemy-cf-d1' },
  ],
  media: [
    {
      type: 'image',
      src: diagram,
      width: 1170,
      height: 1911,
      alt: 'Diagram of how Apache Superset reaches Cloudflare D1 with sqlalchemy-d1 0.2.0 and my Superset pull request, number 44505. Apache Superset 7.0 has its own built-in D1 engine spec, and its d1 extra installs sqlalchemy-d1 0.2.0. Superset connects through a d1://account:token@database address to sqlalchemy-d1 0.2.0, which I rebuilt. It adds the d1:// name, date columns, and schemas and views, and it hides D1’s internal _cf_ tables. It builds on sqlalchemy-cloudflare-d1, the community dialect with its own driver, which talks to Cloudflare D1, a serverless SQLite database, over HTTPS through the D1 REST API. Superset and sqlalchemy-d1 are outlined in orange as the parts I changed. Two packages are retired: dbapi-d1, replaced by the community driver, and superset-engine-d1, replaced by Superset’s own engine spec.',
      caption:
        'How Superset talks to D1 with sqlalchemy-d1 0.2.0 and my pull request. Orange marks my changes.',
    },
  ],
  vhs: {
    spineLabel: 'SUPERSET D1',
    labelVariant: 'classic',
    accent: '#ff7a1a',
    recorded: 'SEP 2026',
  },
}
