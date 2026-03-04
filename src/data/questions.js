/**
 * Three questionnaires for the Partner – Operations & Institutional Services assessment.
 * Based on NYDIG role: operations, institutional client delivery, and operational excellence.
 * Each has a title and 5 questions; each question has 4–6 answer options.
 */
export const QUESTIONNAIRES = [
  {
    id: 'operations-delivery',
    title: 'Operations & Service Delivery',
    description: 'Assess your approach to operational delivery, scaling, and efficiency in institutional services.',
    questions: [
      {
        id: 1,
        text: 'When operational demand from institutional clients spikes and resources are fixed, how do you respond?',
        answers: [
          { id: 'a', text: 'Prioritize by client impact and SLA commitments; document trade-offs and communicate to stakeholders.' },
          { id: 'b', text: 'Escalate to leadership for additional resourcing or scope adjustment.' },
          { id: 'c', text: 'Temporarily simplify or defer non-critical workflows to protect core custody and settlement operations.' },
          { id: 'd', text: 'Coordinate with product and engineering to identify quick automation or process wins.' },
          { id: 'e', text: 'Implement a triage framework and ensure escalation paths are clear for clients.' },
        ],
      },
      {
        id: 2,
        text: 'How do you typically define and maintain service standards and SLAs for institutional clients?',
        answers: [
          { id: 'a', text: 'Base them on client requirements, regulatory expectations, and internal capacity; review and update regularly.' },
          { id: 'b', text: 'Align with product and compliance on measurable targets and escalation triggers.' },
          { id: 'c', text: 'Start with industry benchmarks, then tailor per client segment and document in agreements.' },
          { id: 'd', text: 'Define clear ownership per workflow (custody, settlement, transactions) and track against KPIs.' },
          { id: 'e', text: 'Balance stretch goals with operational reality and ensure teams can meet what we promise.' },
        ],
      },
      {
        id: 3,
        text: 'You identify a scalability bottleneck in custody or settlement workflows. What is your first step?',
        answers: [
          { id: 'a', text: 'Map the current process, quantify the impact, and propose options (process, tech, or capacity).' },
          { id: 'b', text: 'Partner with engineering and product to assess automation or platform improvements.' },
          { id: 'c', text: 'Document the gap and risk, then socialize with leadership and relevant teams for a plan.' },
          { id: 'd', text: 'Implement short-term workarounds while driving a longer-term solution with clear ownership.' },
          { id: 'e', text: 'Convene cross-functional stakeholders to align on priority and timeline.' },
        ],
      },
      {
        id: 4,
        text: 'How do you improve efficiency across custody, settlement, and transaction workflows without compromising risk controls?',
        answers: [
          { id: 'a', text: 'Identify repetitive, rule-based steps for automation; keep approval and exception paths human-led.' },
          { id: 'b', text: 'Streamline handoffs and reduce redundant checks after validating control effectiveness.' },
          { id: 'c', text: 'Work with compliance to ensure any process change maintains or strengthens controls.' },
          { id: 'd', text: 'Pilot changes in one workflow or client segment, measure, then scale with documentation.' },
          { id: 'e', text: 'Balance quick wins with a roadmap that aligns operations, product, and compliance.' },
        ],
      }
    ],
  },
  {
    id: 'institutional-clients',
    title: 'Institutional Client Operations & Collaboration',
    description: 'Evaluate how you manage institutional client delivery, onboarding, and cross-functional execution.',
    questions: [
      {
        id: 1,
        text: 'How do you approach onboarding and lifecycle management for new institutional accounts?',
        answers: [
          { id: 'a', text: 'Define a clear onboarding playbook with milestones, owners, and client touchpoints; track to completion.' },
          { id: 'b', text: 'Align with compliance and product early so requirements and timelines are realistic.' },
          { id: 'c', text: 'Assign a single point of contact and coordinate internal teams behind the scenes.' },
          { id: 'd', text: 'Set expectations with the client and internal stakeholders; document and review at each stage.' },
          { id: 'e', text: 'Balance speed with thoroughness; ensure risk and compliance sign-off before go-live.' },
        ],
      },
      {
        id: 2,
        text: 'An institutional client escalates a complex operational issue that spans product, compliance, and operations. What do you do?',
        answers: [
          { id: 'a', text: 'Own the escalation: coordinate the right internal teams, set a response timeline, and keep the client updated.' },
          { id: 'b', text: 'Gather facts and impact, then convene product, compliance, and operations to agree on a path.' },
          { id: 'c', text: 'Document the issue and route to the appropriate owners while tracking to resolution.' },
          { id: 'd', text: 'Communicate with the client on timeline and next steps; drive internal alignment in parallel.' },
          { id: 'e', text: 'Ensure there is a single owner for the client relationship and a clear escalation path.' },
        ],
      },
      {
        id: 3,
        text: 'How do you partner with product, compliance, and engineering to improve operational processes?',
        answers: [
          { id: 'a', text: 'Share operational pain points and client feedback; propose solutions and co-own implementation.' },
          { id: 'b', text: 'Participate in roadmap and design discussions so operations requirements are built in early.' },
          { id: 'c', text: 'Define clear handoffs and SLAs between teams; run regular syncs to resolve blockers.' },
          { id: 'd', text: 'Use data (volume, errors, cycle time) to prioritize what to fix or automate first.' },
          { id: 'e', text: 'Balance client delivery with internal improvement; avoid letting day-to-day firefighting block strategic work.' },
        ],
      },
      {
        id: 4,
        text: 'You need to coordinate cross-functional execution across product, compliance, and engineering with a tight deadline. How do you proceed?',
        answers: [
          { id: 'a', text: 'Clarify roles and dependencies; set a shared timeline and daily or bi-daily check-ins.' },
          { id: 'b', text: 'Identify the critical path and any regulatory or client commitments; align on those first.' },
          { id: 'c', text: 'Designate a single point of coordination and ensure escalation paths are clear.' },
          { id: 'd', text: 'Document decisions and trade-offs so the team can move quickly without re-litigating.' },
          { id: 'e', text: 'Communicate progress and blockers to stakeholders so expectations stay aligned.' },
        ],
      }
    ],
  },
  {
    id: 'risk-compliance-excellence',
    title: 'Risk, Compliance & Operational Excellence',
    description: 'Explore how you handle operational gaps, risk controls, and excellence in regulated environments.',
    questions: [
      {
        id: 1,
        text: 'How do you identify and address operational gaps and scalability challenges before they impact clients?',
        answers: [
          { id: 'a', text: 'Run regular reviews of capacity, error rates, and cycle times; flag trends and plan ahead.' },
          { id: 'b', text: 'Stay close to client feedback and internal pain points; prioritize fixes with the biggest impact.' },
          { id: 'c', text: 'Map end-to-end workflows and stress-test them against growth and failure scenarios.' },
          { id: 'd', text: 'Partner with compliance and risk to ensure controls keep pace with product and scale.' },
          { id: 'e', text: 'Document gaps and own or assign remediation with clear timelines and accountability.' },
        ],
      },
      {
        id: 2,
        text: 'You operate in a regulated financial or digital-asset environment. How do you balance speed of delivery with compliance and risk?',
        answers: [
          { id: 'a', text: 'Embed compliance and risk in process design so requirements are met by default.' },
          { id: 'b', text: 'Document controls and get sign-off before launch; avoid shortcuts that create regulatory or reputational risk.' },
          { id: 'c', text: 'Work with compliance to clarify what is mandatory vs. flexible; optimize within the guardrails.' },
          { id: 'd', text: 'Keep an audit trail of decisions and changes so we can demonstrate oversight.' },
          { id: 'e', text: 'Prioritize client and regulatory commitments; sequence other work around them.' },
        ],
      },
      {
        id: 3,
        text: 'How do you contribute to operational strategy and long-term planning while managing day-to-day delivery?',
        answers: [
          { id: 'a', text: 'Reserve time for strategy; tie it to capacity, risk, and client growth so it stays relevant.' },
          { id: 'b', text: 'Use operational data and client input to shape priorities and roadmap discussions.' },
          { id: 'c', text: 'Align with leadership on a few strategic themes and drive initiatives in parallel to BAU.' },
          { id: 'd', text: 'Document current state and target state; break long-term plan into phases with owners.' },
          { id: 'e', text: 'Balance firefighting with investing in repeatable processes that free capacity for strategy.' },
        ],
      }
    ],
  },
]

/** Total number of questions across all questionnaires. */
export const TOTAL_QUESTIONS_COUNT = QUESTIONNAIRES.reduce((sum, q) => sum + q.questions.length, 0)

/** Display: number of questionnaires (sections). */
export const QUESTIONNAIRE_COUNT = 3

/** Display: total number of questions. */
export const QUESTION_COUNT = 11

/** Assessment duration in minutes (for instructions and timer). */
export const ASSESSMENT_DURATION_MINUTES = 11

/** @deprecated Use QUESTIONNAIRES and flatten if needed. */
export const QUESTIONS = QUESTIONNAIRES.flatMap((q) => q.questions)
