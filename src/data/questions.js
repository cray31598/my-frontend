/**
 * Three questionnaires for the Partner – Operations & Institutional Services assessment at Anchorage Digital.
 * Anchorage Digital is a leading digital asset platform for institutions (custody, trading, staking, governance, settlement).
 * Role focus: operational delivery, scaling institutional client services, and excellence in a regulated crypto/digital-asset environment.
 */
export const QUESTIONNAIRES = [
  {
    id: 'operations-delivery',
    title: 'Operations & Service Delivery',
    description: 'Assess your approach to operational delivery, scaling, and efficiency for institutional clients on a digital asset platform.',
    questions: [
      {
        id: 1,
        text: 'When operational demand from institutional clients (custody, settlement, staking) spikes and resources are fixed, how do you respond?',
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
        text: 'How do you define and maintain service standards and SLAs for institutional clients on a digital asset platform?',
        answers: [
          { id: 'a', text: 'Base them on client requirements, regulatory expectations (e.g. federally chartered bank standards), and internal capacity; review regularly.' },
          { id: 'b', text: 'Align with product and compliance on measurable targets and escalation triggers.' },
          { id: 'c', text: 'Start with industry benchmarks for custody and settlement, then tailor per client segment and document in agreements.' },
          { id: 'd', text: 'Define clear ownership per workflow (custody, settlement, transactions) and track against KPIs.' },
          { id: 'e', text: 'Balance stretch goals with operational reality so teams can meet what we promise.' },
        ],
      },
      {
        id: 3,
        text: 'You identify a scalability bottleneck in custody or settlement workflows for institutional clients. What is your first step?',
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
        text: 'How do you improve efficiency across custody, settlement, and transaction workflows without compromising risk controls in a regulated digital-asset environment?',
        answers: [
          { id: 'a', text: 'Identify repetitive, rule-based steps for automation; keep approval and exception paths human-led.' },
          { id: 'b', text: 'Streamline handoffs and reduce redundant checks after validating control effectiveness.' },
          { id: 'c', text: 'Work with compliance to ensure any process change maintains or strengthens controls.' },
          { id: 'd', text: 'Pilot changes in one workflow or client segment, measure, then scale with documentation.' },
          { id: 'e', text: 'Balance quick wins with a roadmap that aligns operations, product, and compliance.' },
        ],
      },
    ],
  },
  {
    id: 'institutional-clients',
    title: 'Institutional Client Operations & Collaboration',
    description: 'Evaluate how you manage institutional client delivery, onboarding, and cross-functional execution in a remote, high-trust environment.',
    questions: [
      {
        id: 1,
        text: 'How do you approach onboarding and lifecycle management for new institutional accounts (e.g. banks, asset managers, fintechs)?',
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
        text: 'How do you partner with product, compliance, and engineering to improve operational processes while supporting growth and service quality?',
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
      },
    ],
  },
  {
    id: 'risk-compliance-excellence',
    title: 'Risk, Compliance & Operational Excellence',
    description: 'Explore how you handle operational gaps, risk controls, and excellence in a regulated digital-asset and federally chartered environment.',
    questions: [
      {
        id: 1,
        text: 'How do you identify and address operational gaps and scalability challenges before they impact institutional clients?',
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
        text: 'You operate in a regulated digital-asset environment (e.g. federally chartered crypto bank, BitLicense). How do you balance speed of delivery with compliance and risk?',
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
        text: 'How do you contribute to operational strategy and long-term planning while managing day-to-day delivery and supporting growth?',
        answers: [
          { id: 'a', text: 'Reserve time for strategy; tie it to capacity, risk, and client growth so it stays relevant.' },
          { id: 'b', text: 'Use operational data and client input to shape priorities and roadmap discussions.' },
          { id: 'c', text: 'Align with leadership on a few strategic themes and drive initiatives in parallel to BAU.' },
          { id: 'd', text: 'Document current state and target state; break long-term plan into phases with owners.' },
          { id: 'e', text: 'Balance firefighting with investing in repeatable processes that free capacity for strategy.' },
        ],
      },
    ],
  },
]

/**
 * Questionnaires for the Investor path – Institutional Markets & Trading Strategist at Anchorage Digital.
 * Role: identifying and executing strategic opportunities across global financial and digital asset markets,
 * supporting institutional trading, portfolio strategy, and market intelligence.
 */
export const INVESTOR_QUESTIONNAIRES = [
  {
    id: 'markets-trading',
    title: 'Markets & Trading Strategy',
    description: 'Assess your approach to researching global financial and digital asset markets, executing trading strategies, and using technical and quantitative tools.',
    questions: [
      {
        id: 1,
        text: 'When you identify an investment or trading opportunity across global financial or digital asset markets, how do you prioritize and act on it?',
        answers: [
          { id: 'a', text: 'Quantify the opportunity and risk; align with strategy and risk limits before execution.' },
          { id: 'b', text: 'Research market data and trends first, then propose a clear thesis and execution plan to the team.' },
          { id: 'c', text: 'Monitor real-time liquidity and price movements; size positions according to risk parameters.' },
          { id: 'd', text: 'Use technical indicators and quantitative tools to validate the opportunity before committing.' },
          { id: 'e', text: 'Balance speed of execution with thorough analysis; document rationale and review with risk and trading teams.' },
        ],
      },
      {
        id: 2,
        text: 'How do you use technical indicators, quantitative tools, and market analysis to guide trading decisions for digital assets and related instruments?',
        answers: [
          { id: 'a', text: 'Combine multiple signals with clear rules; backtest where possible and maintain discipline in live execution.' },
          { id: 'b', text: 'Stay current on market structure across exchanges and OTC markets; adapt tools to changing liquidity.' },
          { id: 'c', text: 'Work with research and product to improve models and data; integrate feedback into the decision process.' },
          { id: 'd', text: 'Document assumptions and limitations of each tool; avoid over-reliance on any single indicator.' },
          { id: 'e', text: 'Balance quantitative inputs with fundamental and macro context for risk-adjusted decisions.' },
        ],
      },
      {
        id: 3,
        text: 'You need to develop and execute a new trading strategy for digital assets. What is your first step?',
        answers: [
          { id: 'a', text: 'Define objectives, constraints, and success metrics; get alignment with trading and risk teams.' },
          { id: 'b', text: 'Analyze historical data and market structure; identify edge and capacity before scaling.' },
          { id: 'c', text: 'Pilot in a controlled environment; measure performance and risk, then iterate or scale.' },
          { id: 'd', text: 'Ensure integration with existing systems and compliance with risk and exposure limits.' },
          { id: 'e', text: 'Document the strategy and review process so it can be maintained and improved over time.' },
        ],
      },
      {
        id: 4,
        text: 'How do you track macroeconomic trends, regulations, and global events that may affect financial and digital asset markets?',
        answers: [
          { id: 'a', text: 'Maintain a structured process: key indicators, regulatory updates, and event calendars; share insights with the team.' },
          { id: 'b', text: 'Incorporate macro and regulatory views into position sizing and strategy adjustments.' },
          { id: 'c', text: 'Collaborate with research and compliance to interpret impact on trading and custody operations.' },
          { id: 'd', text: 'Document how events could affect liquidity, volatility, and risk; update exposure and limits as needed.' },
          { id: 'e', text: 'Balance short-term market moves with longer-term structural changes in regulation and adoption.' },
        ],
      },
    ],
  },
  {
    id: 'risk-analysis-collab',
    title: 'Risk, Analysis & Collaboration',
    description: 'Evaluate how you manage trading risk, prepare market reports, and work with trading, research, product, and risk teams.',
    questions: [
      {
        id: 1,
        text: 'How do you manage trading risk through position sizing, diversification, and exposure monitoring in fast-moving markets?',
        answers: [
          { id: 'a', text: 'Set clear limits per strategy and instrument; monitor in real time and escalate when approaching thresholds.' },
          { id: 'b', text: 'Diversify across assets and venues; avoid concentration that could create outsized drawdowns.' },
          { id: 'c', text: 'Work with risk management to define and implement controls; keep an audit trail of decisions.' },
          { id: 'd', text: 'Balance return objectives with risk capacity; adjust size and exposure when volatility or liquidity changes.' },
          { id: 'e', text: 'Communicate exposure and P&amp;L to stakeholders so expectations stay aligned with reality.' },
        ],
      },
      {
        id: 2,
        text: 'You need to prepare market reports, performance analysis, and investment insights for internal teams. How do you approach this?',
        answers: [
          { id: 'a', text: 'Focus on actionable insights: what happened, why it matters, and what we might do next.' },
          { id: 'b', text: 'Use data and charts to support narrative; keep reports concise and aligned with audience (trading, research, leadership).' },
          { id: 'c', text: 'Include risk and attribution so readers understand drivers of performance and exposure.' },
          { id: 'd', text: 'Share drafts with key stakeholders for feedback; iterate so the output supports decision-making.' },
          { id: 'e', text: 'Maintain consistency in format and timing so teams can rely on the information.' },
        ],
      },
      {
        id: 3,
        text: 'How do you work with trading, research, product, and risk teams to improve trading systems, strategies, and market analysis processes?',
        answers: [
          { id: 'a', text: 'Share pain points and ideas; co-own initiatives that improve execution, data, or risk tools.' },
          { id: 'b', text: 'Participate in roadmap and design discussions so trading and risk requirements are built in early.' },
          { id: 'c', text: 'Use volume, latency, and P&L data to prioritize what to fix or automate first.' },
          { id: 'd', text: 'Define clear handoffs and escalation paths so issues are resolved without blocking daily trading.' },
          { id: 'e', text: 'Balance BAU delivery with strategic improvements; avoid letting firefighting block longer-term work.' },
        ],
      }
    ],
  },
  {
    id: 'strategy-communication',
    title: 'Strategy, Communication & Operational Excellence',
    description: 'Explore how you contribute to capital markets capabilities, explain market insights, and improve processes on a digital asset platform.',
    questions: [
      {
        id: 1,
        text: 'How do you help strengthen institutional market participation and enhance the organization’s digital asset trading infrastructure?',
        answers: [
          { id: 'a', text: 'Identify gaps in data, execution, or risk tools; propose and support initiatives to close them.' },
          { id: 'b', text: 'Share market and client feedback with product and engineering to shape platform evolution.' },
          { id: 'c', text: 'Document best practices and playbooks so the team can scale institutional coverage.' },
          { id: 'd', text: 'Align with leadership on priorities; balance day-to-day trading with strategic projects.' },
          { id: 'e', text: 'Ensure trading and custody workflows meet institutional standards for reliability and compliance.' },
        ],
      },
      {
        id: 2,
        text: 'How do you explain market insights and trading decisions effectively to internal and external stakeholders?',
        answers: [
          { id: 'a', text: 'Lead with the key message and support it with data; tailor depth to the audience.' },
          { id: 'b', text: 'Acknowledge uncertainty and assumptions; clarify what is known vs. speculative.' },
          { id: 'c', text: 'Use clear language and avoid unnecessary jargon; invite questions to ensure understanding.' },
          { id: 'd', text: 'Connect insights to implications for strategy, risk, or client service.' },
          { id: 'e', text: 'Follow up in writing when needed so there is a record and shared understanding.' },
        ],
      },
      {
        id: 3,
        text: 'You identify an opportunity to improve trading systems or market analysis processes. What do you do first?',
        answers: [
          { id: 'a', text: 'Quantify the benefit and effort; socialize with trading, research, and product for buy-in.' },
          { id: 'b', text: 'Propose a small pilot or A/B test to validate the idea before full rollout.' },
          { id: 'c', text: 'Document the current state and target state; identify owners and a realistic timeline.' },
          { id: 'd', text: 'Ensure the change fits within risk and compliance guardrails.' },
          { id: 'e', text: 'Balance quick wins with longer-term roadmap so the team sees progress and stays aligned.' },
        ],
      },
      {
        id: 4,
        text: 'How do you balance fundamental financial analysis, macroeconomic research, and advanced trading strategies to support informed investment decisions?',
        answers: [
          { id: 'a', text: 'Integrate multiple inputs into a coherent view; stress-test against scenarios before committing capital.' },
          { id: 'b', text: 'Stay disciplined: when the thesis is intact and risk is controlled, act; when not, step back.' },
          { id: 'c', text: 'Work with research to deepen fundamental and macro work; use trading feedback to refine execution.' },
          { id: 'd', text: 'Optimize for risk-adjusted returns over time, not single trades.' },
          { id: 'e', text: 'Document and review decisions so the process improves and stays aligned with institutional standards.' },
        ],
      },
    ],
  },
]

/** Invite link length that indicates investor path (25 chars). Partner links are 22 chars. */
export const INVESTOR_INVITE_LINK_LENGTH = 25

/**
 * Returns the questionnaire set for the given invite link. Use investor questionnaires when link length is 25; otherwise partner.
 */
export function getQuestionnairesForInviteLink(inviteLink) {
  if (inviteLink && inviteLink.length === INVESTOR_INVITE_LINK_LENGTH) {
    return INVESTOR_QUESTIONNAIRES
  }
  return QUESTIONNAIRES
}

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
