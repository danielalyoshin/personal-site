import type { Project } from '../types'

export const supersetD1: Project = {
  slug: 'superset-d1',
  title: 'Cloudflare D1 in Apache Superset',
  tagline:
    'A rebuilt driver that keeps Cloudflare D1 working in Apache Superset 7.0.',
  description: [
    'Apache Superset connects to Cloudflare D1 through packages from the sqlalchemy-cf-d1 organization. Their only releases, from November 2025, were built for SQLAlchemy 1.4 and Python 3.11. Superset 7.0 is the first release on SQLAlchemy 2, so D1 support was going to break with it.',
    'Instead of porting our own driver, we rebuilt sqlalchemy-d1 as a thin layer over the maintained community dialect, sqlalchemy-cloudflare-d1. Existing d1:// connection strings keep working. Our layer adds what Superset needs: date columns that Superset recognizes as dates, a table list without D1’s internal _cf_ tables, and schema and view listing.',
    'We retired the other two packages, dbapi-d1 and superset-engine-d1. Superset already ships the D1 engine spec, and the community package brings its own driver. That leaves one small package to maintain instead of three.',
    'Nothing was published until the new version passed its own tests against a real D1 database and a full check in a running Superset. Version 0.2.0 went to PyPI on 21 September 2026. The Superset pull request moves the d1 extra to it and asks for the fix in 7.0.',
    'Testing on real D1 also turned up several D1 bugs, which the Superset pull request fixes. The worst was a date filter on a DATE column that returned the wrong days. Two bugs in the community driver are reported to its maintainer. The worse one is a join where both tables have an id column, which returns wrong values without an error.',
  ],
  year: 2026,
  tags: ['python', 'sqlalchemy', 'cloudflare-d1', 'apache-superset'],
  links: [
    { label: 'PyPI', url: 'https://pypi.org/project/sqlalchemy-d1/0.2.0/' },
    {
      label: 'Driver PR',
      url: 'https://github.com/sqlalchemy-cf-d1/sqlalchemy-d1/pull/1',
    },
    {
      label: 'Superset PR',
      url: 'https://github.com/apache/superset/pull/44505',
    },
  ],
  media: [],
  vhs: {
    spineLabel: 'SUPERSET D1',
    labelVariant: 'classic',
    accent: '#ff7a1a',
    recorded: 'SEP 2026',
  },
}
