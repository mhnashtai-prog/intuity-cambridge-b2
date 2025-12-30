// Review Structures Data for INTUITY Review Writing Module
// B2 First: engaging, semi-formal reviews with clear opinions + recommendations

const REVIEW_STRUCTURES = {
  "entertainment": {
    "title": "Entertainment Reviews (Films, Concerts, TV)",
    "purpose": "For reviewing entertainment experiences with personal opinion and recommendation",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "Set context + give basic information about what you're reviewing",
        "phrases": [
          "Choosing ... can be a real challenge. However, ... is certainly an option worth considering.",
          "When it comes to choosing ..., the number of options can be overwhelming.",
          "If you are looking for ..., then ... could be the perfect option for you.",
          "Selecting the right ... is never easy, but ...",
          "... might just be the ideal ... you have been searching for."
        ]
      },
      "features": {
        "label": "Features & Highlights",
        "purpose": "Describe what stands out + what impressed you most",
        "phrases": [
          "The thing that is most likely to impress you is ...",
          "What makes ... particularly impressive is ...",
          "The other feature which I found most impressive is ...",
          "If you happen to appreciate ..., by far the most stunning aspect is ...",
          "By far the best feature / the most appealing aspect of ... is ...",
          "Anyone interested in ... will be especially impressed by/at ..."
        ]
      },
      "background": {
        "label": "Background & Context",
        "purpose": "Provide factual context + establish credibility",
        "phrases": [
          "Known/famous for its ...",
          "Located in / Designed by / Built in ..., it remains ...",
          "Regarded / Considered as one of the best / the most ...",
          "By far one of the best / the most ... is ...",
          "... rival / compete with ..."
        ]
      },
      "recommendation": {
        "label": "Recommendation",
        "purpose": "Strong closing with clear recommendation + target audience",
        "phrases": [
          "I guarantee that ... will not disappoint anyone who is seeking / looking for ...",
          "This is a ... which you cannot afford to miss for its ...",
          "For anyone who is interested in ... is a must.",
          "I can assure you that ... will leave a lasting impression on you."
        ]
      }
    }
  },

  "places": {
    "title": "Place Reviews (Restaurants, Hotels, Venues)",
    "purpose": "For reviewing places and services with balanced evaluation and recommendation",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "Explain your choice + set expectations",
        "phrases": [
          "Choosing a place for ... can be difficult, but ...",
          "When it comes to choosing ..., you want somewhere that ...",
          "If you are looking for ... rather than ..., then ... could be the perfect choice for you.",
          "Selecting the right ... is never easy, especially for ..."
        ]
      },
      "features_quality": {
        "label": "Features & Quality",
        "purpose": "Describe what you experienced + highlight strengths",
        "phrases": [
          "The thing that is most likely to impress you is ...",
          "What makes this ... particularly impressive is ...",
          "The other feature which I found most impressive is ...",
          "By far the best feature is ...",
          "If you happen to appreciate ..., by far the most ... aspect is ..."
        ]
      },
      "atmosphere_context": {
        "label": "Atmosphere & Context",
        "purpose": "Paint the picture + provide credibility",
        "phrases": [
          "Known for its ..., ... is regarded as ...",
          "Located in ..., it remains ...",
          "Designed by ..., it remains ...",
          "By far one of the most ... was when ...",
          "Anyone interested in ... will be especially impressed by ..."
        ]
      },
      "recommendation": {
        "label": "Recommendation",
        "purpose": "Clear recommendation + who it's suitable for",
        "phrases": [
          "I would highly recommend ... to anyone interested in ...",
          "I guarantee that ... will not disappoint anyone who is seeking ...",
          "This is a ... which you cannot afford to miss for its ...",
          "For anyone who is looking for ..., this is a must.",
          "I can assure you that ... will leave a lasting impression on you."
        ]
      }
    }
  },

  "products": {
    "title": "Product Reviews (Apps, Books, Games, Gadgets)",
    "purpose": "For reviewing products and services with practical evaluation",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "Introduce the product + your context for using it",
        "phrases": [
          "Choosing the right ... can be challenging with so many available.",
          "When it comes to ..., you need something that ...",
          "If you are looking for ... that combines ... with ..., then ... could be the perfect choice.",
          "Selecting the right ... is never easy, but ..."
        ]
      },
      "features_functionality": {
        "label": "Features & Functionality",
        "purpose": "Explain what it does + what works well",
        "phrases": [
          "What makes this ... particularly impressive is ...",
          "The thing that is most likely to impress you is ...",
          "By far the best feature is ...",
          "The other feature which I found most impressive is ...",
          "If you happen to appreciate ..., by far the most useful aspect is ...",
          "Anyone interested in ... will be especially impressed by ..."
        ]
      },
      "usefulness_impact": {
        "label": "Usefulness & Impact",
        "purpose": "Explain how it helped you + practical benefits",
        "phrases": [
          "Known for its ..., ... is regarded as ...",
          "What makes it so valuable is that ...",
          "The reason I find it so useful is that ...",
          "As a result, I ...",
          "This has helped me ...",
          "By far one of the most useful aspects was ..."
        ]
      },
      "recommendation": {
        "label": "Recommendation",
        "purpose": "Clear verdict + target users",
        "phrases": [
          "I would highly recommend ... to anyone interested in ...",
          "I guarantee that this ... will not disappoint anyone who is seeking ...",
          "For anyone who is looking for ..., this is a must.",
          "This is a ... which you cannot afford to miss for its ...",
          "I can assure you that ... will leave a lasting impression on you."
        ]
      }
    }
  },

  "experiences": {
    "title": "Experience Reviews (Trips, Courses, Activities)",
    "purpose": "For reviewing experiences and organized activities with evaluation and recommendation",
    "sections": {
      "introduction": {
        "label": "Introduction",
        "purpose": "Set the scene + explain what you did",
        "phrases": [
          "Choosing the right ... can be challenging, but ...",
          "When it comes to choosing ..., you want somewhere with ...",
          "If you are looking for ... that combines ... with ..., then ...",
          "Selecting the right ... is never easy, especially if ..."
        ]
      },
      "organization_quality": {
        "label": "Organization & Quality",
        "purpose": "Describe how well it was run + what impressed you",
        "phrases": [
          "What makes this ... particularly impressive is ...",
          "The thing that is most likely to impress you is ...",
          "By far the best feature is ...",
          "The other feature which I found most impressive is ...",
          "Anyone interested in ... will be especially impressed by ...",
          "If you happen to appreciate ..., by far the most ... aspect is ..."
        ]
      },
      "learning_outcomes": {
        "label": "What You Gained",
        "purpose": "Explain what you learned or achieved",
        "phrases": [
          "What made the ... so valuable is that ...",
          "Known for its ..., ... is regarded as ...",
          "As a result, I ...",
          "By far one of the most ... moments was when ...",
          "This helped me develop / improve / understand ..."
        ]
      },
      "recommendation": {
        "label": "Recommendation",
        "purpose": "Strong recommendation + who it suits",
        "phrases": [
          "I would highly recommend ... to anyone interested in ...",
          "I guarantee that this ... will not disappoint anyone who is seeking ...",
          "This is a ... which you cannot afford to miss for its ...",
          "For anyone who is looking for ..., this is a must.",
          "I can assure you that ... will leave a lasting impression on you."
        ]
      }
    }
  }
};
