import type { Project } from '../types'
// Rendered from the two .html sources beside them by `npm run render:diagrams`.
import diagram from './media/superset-d1-diagram.webp'
import narrowDiagram from './media/superset-d1-diagram-narrow.webp'

export const supersetD1: Project = {
  slug: 'superset-d1',
  title: 'Cloudflare D1 in Apache Superset',
  tagline:
    'Maintaining the Cloudflare D1 support I helped build for Apache Superset.',
  description: [
    'In 2025 I was one of the people who built the packages that first connected Apache Superset, the open-source data visualization platform, to Cloudflare D1, a serverless SQLite database. Today I’m their primary maintainer.',
    'Superset connects to D1 through sqlalchemy-d1, a thin layer over sqlalchemy-cloudflare-d1, the maintained community dialect.',
    'Superset installs it through its d1 extra. Superset’s built-in D1 engine spec runs queries on the community driver, which sends them to D1 over HTTPS.',
  ],
  year: 2025,
  role: 'Primary maintainer',
  tags: ['python', 'sqlalchemy', 'cloudflare-d1', 'apache-superset'],
  links: [
    { label: 'PyPI', url: 'https://pypi.org/project/sqlalchemy-d1/' },
    {
      label: 'Source',
      url: 'https://github.com/sqlalchemy-cf-d1/sqlalchemy-d1',
    },
    {
      label: 'Superset PR',
      url: 'https://github.com/apache/superset/pull/44505',
    },
  ],
  media: [
    {
      type: 'image',
      src: diagram,
      width: 2080,
      height: 1638,
      narrow: { src: narrowDiagram, width: 1170, height: 2184 },
      alt: 'System diagram of how Apache Superset and the Cloudflare D1 packages work together. Inside Apache Superset are three parts: the D1 engine spec, SQLAlchemy’s engine and inspector, and the d1 extra. At install time, the d1 extra installs sqlalchemy-d1, and sqlalchemy-d1 requires sqlalchemy-cloudflare-d1. At run time, the SQLAlchemy engine loads the d1 dialect from sqlalchemy-d1, and the inspector inspects tables and views through it. sqlalchemy-d1 adds what Superset needs. It subclasses the dialect in sqlalchemy-cloudflare-d1, the community package, whose dialect compiles SQL and reads the URL and whose DB-API driver sends SQL with httpx. The engine spec runs Superset’s SQL on that driver, and the driver reaches Cloudflare D1, a serverless SQLite database, over HTTPS through the REST API’s /raw endpoint. Solid lines are run time and dashed lines are install time. The engine spec, the d1 extra and sqlalchemy-d1 are outlined in orange as my changes.',
      caption: 'How Superset and the D1 packages work together.',
    },
  ],
  vhs: {
    spineLabel: 'SUPERSET D1',
    labelVariant: 'classic',
    accent: '#ff7a1a',
    recorded: 'SEP 2026',
  },
}
