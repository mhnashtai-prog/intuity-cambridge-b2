// Report Structures Data for INTUITY Report Writing Module
// B2 First: practical, clear, semi-formal reports with balanced evaluation + recommendations

const REPORT_STRUCTURES = {
  "educational": {
    "title": "Educational Assessment Reports",
    "purpose": "For evaluating school facilities, programmes, trips, or educational services with clear recommendations",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "State purpose + source of information (survey/interviews/feedback)",
        "phrases": [
          "The main objective of this report is to assess...",
          "The purpose of this report is to provide an overview of...",
          "This report focuses on evaluating...",
          "The aim of this report is to evaluate... and suggest improvements.",
          "This report is based on feedback collected from...",
          "The information presented in this report was collected through...",
          "The findings in this report are drawn from..."
        ]
      },
      "current_situation": {
        "label": "Current Situation",
        "purpose": "Describe what exists now + highlight strengths",
        "phrases": [
          "It is generally agreed that...",
          "Overall, the general opinion is that...",
          "There is broad agreement that...",
          "At present, students have access to...",
          "One positive aspect of ... is ...",
          "By far the best aspect of ... is ...",
          "What makes ... so valuable is that...",
          "Recent improvements/investment have had a positive effect on..."
        ]
      },
      "problems": {
        "label": "Problems Identified",
        "purpose": "Explain issues with cause → effect (impact on students/users)",
        "phrases": [
          "However, one major concern expressed by students is...",
          "A common complaint relates to...",
          "By far the worst aspect of ... is that...",
          "... is far from ideal since ...",
          "This is mainly due to the fact that...",
          "As a result, ...",
          "Consequently, ...",
          "This has resulted in...",
          "Which affects students' ability to..."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Offer practical, specific solutions + priority + brief conclusion",
        "phrases": [
          "One key recommendation would be to...",
          "I would strongly recommend...",
          "It may be worth considering...",
          "Priority should be given to...",
          "One possible improvement would be to...",
          "In order to improve/reduce/increase..., ...",
          "Steps could be taken to...",
          "It is essential that...",
          "Taking everything into account, it seems clear that...",
          "To sum up, these changes would..."
        ]
      }
    }
  },

  "community": {
    "title": "Community Assessment Reports",
    "purpose": "For evaluating local facilities and services for young people/residents",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "State purpose + local context + evidence source",
        "phrases": [
          "The purpose of this report is to provide an overview of...",
          "This report examines the local ... and suggests improvements.",
          "This report focuses on assessing ... for young users.",
          "This report is based on feedback collected from local residents/users.",
          "The information presented was collected through questionnaires/interviews."
        ]
      },
      "existing_provision": {
        "label": "Existing Facilities",
        "purpose": "Describe what is available + what works well",
        "phrases": [
          "Currently, the centre provides...",
          "At present, users have access to...",
          "It is generally agreed that the facilities are...",
          "One positive aspect of the centre is...",
          "By far the best aspect of the facility is...",
          "What makes the centre so attractive is that..."
        ]
      },
      "improvements_needed": {
        "label": "Improvements Needed",
        "purpose": "Explain key issues + impact on participation",
        "phrases": [
          "One major concern raised by users is...",
          "A common complaint relates to...",
          "By far the worst aspect is...",
          "The facilities are far from ideal at peak times, as...",
          "This is mainly due to the fact that...",
          "As a result, some young people...",
          "Consequently, attendance/participation decreases."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Suggest realistic improvements for young users + wrap up",
        "phrases": [
          "One key recommendation would be to...",
          "Priority should be given to...",
          "It may be worth considering...",
          "In order to attract more young users, ...",
          "Steps could be taken to...",
          "I would strongly recommend...",
          "Taking everything into account, it seems clear that..."
        ]
      }
    }
  },

  "workplace": {
    "title": "Workplace Assessment Reports",
    "purpose": "For evaluating work experience placements and learning benefits",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "State placement purpose + how evidence was collected",
        "phrases": [
          "The main objective of this report is to evaluate my work experience placement.",
          "This report focuses on describing my placement and what I learned.",
          "This report is based on my observations and feedback from my supervisor.",
          "The information presented was collected through daily notes and discussions."
        ]
      },
      "programme_activities": {
        "label": "Company & Tasks",
        "purpose": "Describe where you worked + what you did",
        "phrases": [
          "The placement took place at...",
          "My main tasks included...",
          "Activities included...",
          "One positive aspect of the placement was...",
          "It was generally felt that staff were supportive and helpful."
        ]
      },
      "learning_outcomes": {
        "label": "Skills Developed",
        "purpose": "Explain skills gained + why it was useful",
        "phrases": [
          "What made the placement so valuable is that...",
          "I developed communication/teamwork/time-management skills.",
          "As a result, I became more confident...",
          "The experience helped me understand workplace expectations.",
          "By far the best aspect of the placement was..."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Recommend continuation + practical improvements",
        "phrases": [
          "I would strongly recommend continuing this placement because...",
          "One key recommendation would be to provide a wider range of tasks.",
          "It may be worth considering adding a short project task.",
          "It is essential that students receive clear guidance before starting.",
          "Taking everything into account, it seems clear that..."
        ]
      }
    }
  },

  "service": {
    "title": "Service Assessment Reports",
    "purpose": "For evaluating services (cafeteria, library services, course organisation) in a B2 report style",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "State what is being assessed + source of feedback",
        "phrases": [
          "The purpose of this report is to provide an overview of...",
          "This report focuses on evaluating ... and suggesting improvements.",
          "This report is based on feedback collected from users/students.",
          "The information presented was collected through a questionnaire."
        ]
      },
      "service_quality": {
        "label": "Current Service",
        "purpose": "Describe the service + positives",
        "phrases": [
          "It is generally agreed that...",
          "Overall, students/users appreciate...",
          "One positive aspect of the service is...",
          "By far the best aspect is...",
          "What makes the service so useful is that..."
        ]
      },
      "issues_identified": {
        "label": "Issues Identified",
        "purpose": "Explain key complaints + cause/effect",
        "phrases": [
          "However, one major concern expressed by users is...",
          "A common complaint relates to...",
          "By far the worst aspect is that...",
          "This is mainly due to the fact that...",
          "As a result, users...",
          "This has resulted in...",
          "Which affects overall satisfaction."
        ]
      },
      "recommendations": {
        "label": "Recommendations",
        "purpose": "Give practical solutions + brief concluding line",
        "phrases": [
          "One key recommendation would be to...",
          "I would strongly recommend...",
          "It may be worth considering...",
          "Priority should be given to...",
          "In order to improve/reduce/increase..., ...",
          "Steps could be taken to...",
          "It is essential that...",
          "To sum up, these changes would..."
        ]
      }
    }
  }
};
