// Report Structures Data for INTUITY Report Writing Module
// Contains formal discourse markers and language patterns for B2 First reports

const REPORT_STRUCTURES = {
  "educational": {
    "title": "Educational Assessment Reports",
    "purpose": "For evaluating school facilities, programmes, or educational services with formal recommendations",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "State the report's purpose, scope, and methodology clearly and formally",
        "phrases": [
          "The purpose of this report is to [assess/evaluate/examine]...",
          "The aim of this report is to [provide/present/analyze]...",
          "This report is based on [survey data/feedback/consultation with]...",
          "This report covers [facilities/activities/services]...",
          "The assessment draws upon [data from/feedback from]...",
          "This evaluation examines [the current state/the effectiveness] of..."
        ]
      },
      "current_situation": {
        "label": "Current Situation",
        "purpose": "Describe the present state objectively, highlighting both strengths and weaknesses",
        "phrases": [
          "At present, the [facilities/programme] are [generally adequate/in good condition]...",
          "Currently, [students/participants] have access to...",
          "The existing [facilities/services] demonstrate [variable quality/satisfactory standards]...",
          "It is generally agreed that [the standard is/provision meets]...",
          "Recent investment in [equipment/resources] has delivered [positive outcomes/improvements]...",
          "However, [certain areas/some aspects] require attention..."
        ]
      },
      "problems": {
        "label": "Problems Identified",
        "purpose": "Present issues clearly with supporting evidence and impact explanation",
        "phrases": [
          "One major concern expressed by [students/users] is...",
          "By far the worst aspect is that...",
          "Another significant problem is...",
          "Student consultation reveals [overcrowding/insufficient resources] as the most significant challenge...",
          "During [examination periods/peak times], [capacity/availability] proves insufficient...",
          "The findings indicate that [current provision/existing systems] fail to meet [contemporary standards/user needs]...",
          "This negatively impacts [students' ability/users' experience]...",
          "Which affects [learning outcomes/service quality]..."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Propose specific, actionable solutions with clear benefits and priority levels",
        "phrases": [
          "I would strongly recommend [extending/improving/modernizing]...",
          "It is essential that [facilities/systems] be [renovated/updated] as a priority...",
          "One key recommendation would be to [implement/introduce/establish]...",
          "Immediate priority should be assigned to...",
          "Could be addressed through [extended hours/additional resources]...",
          "Taking everything into account, these improvements would significantly enhance...",
          "Overall, these targeted improvements would deliver substantial [benefits/enhancements]...",
          "In conclusion, implementing these changes would [improve/transform/optimize]..."
        ]
      }
    }
  },
  "community": {
    "title": "Community Assessment Reports",
    "purpose": "For evaluating local facilities, services, or initiatives that serve the community",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "Establish the community context and report scope",
        "phrases": [
          "This report examines [local facilities/community services] for [young people/residents]...",
          "The purpose of this assessment is to evaluate [current provision/service quality]...",
          "This report is based on survey data from [120 users/local residents]...",
          "The analysis synthesizes [quantitative data/community feedback]...",
          "This evaluation considers [accessibility/quality/effectiveness] of [local services/facilities]..."
        ]
      },
      "existing_provision": {
        "label": "Existing Facilities",
        "purpose": "Document what is currently available and its condition",
        "phrases": [
          "The centre currently provides [facilities/services] in [adequate/good] condition...",
          "At present, [residents/users] have access to...",
          "Existing provision includes [specific facilities/services]...",
          "The facility operates at approximately [percentage] of potential capacity...",
          "Current offerings demonstrate [strengths in/limitations in]...",
          "Whilst popular, [certain facilities/services] demonstrate signs of [aging/inadequacy]..."
        ]
      },
      "improvements_needed": {
        "label": "Improvements Needed",
        "purpose": "Identify gaps and problems affecting community use",
        "phrases": [
          "Survey findings identify [specific issue] as the primary concern...",
          "One major concern raised by [residents/users] is...",
          "Operating hours present significant barriers to [student/community] participation...",
          "Pricing structures, in their current form, exceed [youth/community] affordability thresholds...",
          "The absence of [specific facility/service] limits [accessibility/usage]...",
          "Additionally, [changing rooms/facilities] require urgent refurbishment..."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Propose community-focused improvements with clear benefits",
        "phrases": [
          "It is strongly recommended that the council prioritize...",
          "Implementation of [specific improvement] would substantially lower participation barriers...",
          "Strategic investment priorities should address: (1)... (2)... (3)...",
          "These interventions would achieve [specific benefit] within [timeframe]...",
          "Financial modeling indicates these improvements would [break even/generate revenue]...",
          "Overall, recommended improvements would deliver [community benefit/increased usage]..."
        ]
      }
    }
  },
  "workplace": {
    "title": "Workplace Assessment Reports",
    "purpose": "For evaluating work programmes, internships, or professional development experiences",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "Establish professional context and evaluation criteria",
        "phrases": [
          "This report presents an evaluation of [the programme/the experience]...",
          "The aim of this assessment is to analyze [effectiveness/outcomes] of...",
          "The analysis draws upon [participant observation/performance data]...",
          "This evaluation examines [programme delivery/learning outcomes]..."
        ]
      },
      "programme_activities": {
        "label": "Programme & Activities",
        "purpose": "Describe what was provided and how it was structured",
        "phrases": [
          "The programme comprised [structured training/practical experience]...",
          "Activities included [specific tasks/responsibilities]...",
          "Professional mentoring proved highly successful, with [mentors/supervisors] demonstrating...",
          "The structured approach balanced [theory/practice] effectively...",
          "Participants engaged in [real-world projects/authentic tasks]...",
          "Which provided [valuable experience/practical skills development]..."
        ]
      },
      "learning_outcomes": {
        "label": "Learning Outcomes",
        "purpose": "Evaluate what participants gained from the experience",
        "phrases": [
          "The programme delivered substantial value across [multiple dimensions/key areas]...",
          "Professional skills improved markedly, with participants demonstrating...",
          "Participants gained [industry knowledge/practical competencies] that...",
          "The findings indicate that [real-world application/practical experience] exceeded...",
          "Confidence levels showed measurable improvement in [specific areas]...",
          "The immersive context enabled [development/learning] that classroom instruction cannot replicate..."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Advise on programme continuation and enhancement",
        "phrases": [
          "Continuation of this programme is strongly advised...",
          "The benefits substantially exceed those achievable through [alternative approaches]...",
          "To optimize outcomes, it is recommended that [specific enhancement]...",
          "Enhanced [preparation/support] would further smooth [transition/learning]...",
          "In conclusion, this programme represents exceptional [educational/professional] value...",
          "Overall, the programme merits continued investment and expansion..."
        ]
      }
    }
  },
  "service": {
    "title": "Service Assessment Reports",
    "purpose": "For evaluating quality and effectiveness of services (restaurants, facilities, products)",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "State what service is being assessed and evaluation criteria",
        "phrases": [
          "This report assesses [service quality/effectiveness] of...",
          "The purpose of this evaluation is to examine [current performance/user satisfaction]...",
          "This assessment is based on [user feedback/performance metrics]...",
          "The analysis considers [quality/efficiency/accessibility] across [key areas]..."
        ]
      },
      "service_quality": {
        "label": "Service Quality",
        "purpose": "Evaluate current service delivery standards",
        "phrases": [
          "Current service delivery demonstrates [strong/variable] performance...",
          "User satisfaction data indicates [high/moderate] approval ratings...",
          "Service provision exhibits [consistency/variability] across [different areas]...",
          "Response times meet [industry standards/user expectations]...",
          "Staff demonstrate [professional competence/customer focus]...",
          "However, certain aspects require enhancement..."
        ]
      },
      "issues_identified": {
        "label": "Issues Identified",
        "purpose": "Highlight service gaps and quality concerns",
        "phrases": [
          "User feedback identifies [specific issue] as the primary concern...",
          "Service delays present significant challenges during [peak periods]...",
          "Accessibility proves limited for [specific user groups]...",
          "Communication protocols fail to meet [user expectations/best practice]...",
          "Current processes result in [inefficiency/user frustration]...",
          "These issues negatively impact [overall satisfaction/service outcomes]..."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Propose service improvements with expected outcomes",
        "phrases": [
          "It is recommended that [service provider] implement [specific improvement]...",
          "Enhanced [training/systems] would address [identified concerns]...",
          "Strategic investment in [technology/staffing] would improve [service delivery]...",
          "These modifications would substantially enhance [user experience/service quality]...",
          "Implementation timeline of [specific period] is advised...",
          "Overall, these improvements would position the service to [meet/exceed] [user expectations/industry standards]..."
        ]
      }
    }
  }
};
