// ==========================================
// SPEAKING PRACTICE DATA FOR INTUITY
// Part 2: Long Turn (Compare & Describe)
// ==========================================

const SPEAKING_DATA = {
  "comparing": {
    "task": "Compare and contrast these pictures.",
    "phraseBank": {
      "discourse": [
        "I feel that",
        "In many ways",
        "As far as I can judge",
        "To some extent",
        "It seems to me",
        "In many aspects",
        "While",
        "Whereas",
        "By contrast",
        "On the other hand",
        "However",
        "In comparison"
      ],
      "vocabulary": [
        "similar",
        "identical",
        "very much alike",
        "have in common",
        "resemble each other",
        "share similarities",
        "differ",
        "contrast",
        "distinguish",
        "commuting",
        "travelling",
        "cycling",
        "public transport",
        "eco-friendly"
      ]
    },
    "pairs": [
      {
        "image1": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
        "image2": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        "responses": {
          "default": {
            "sections": [
              {
                "icon": "🔗",
                "label": "Similarities",
                "text": "I feel that in many ways the two pictures are similar. They both show people travelling.",
                "phrases": {
                  "discourse": ["I feel that", "in many ways"],
                  "vocabulary": ["similar", "travelling"]
                }
              },
              {
                "icon": "⚡",
                "label": "Difference",
                "text": "While the first picture shows a woman commuting to work by train, the second shows a woman cycling to work.",
                "phrases": {
                  "discourse": ["While"],
                  "vocabulary": ["commuting", "cycling"]
                }
              }
            ]
          },
          "alternative1": {
            "sections": [
              {
                "icon": "🔗",
                "label": "Similarities",
                "text": "As far as I can judge, to some extent the two pictures are identical. They both show people travelling.",
                "phrases": {
                  "discourse": ["As far as I can judge", "to some extent"],
                  "vocabulary": ["identical", "travelling"]
                }
              },
              {
                "icon": "⚡",
                "label": "Difference",
                "text": "Whereas the first picture shows a woman commuting to work by train, the second shows a woman cycling to work.",
                "phrases": {
                  "discourse": ["Whereas"],
                  "vocabulary": ["commuting", "cycling"]
                }
              }
            ]
          },
          "alternative2": {
            "sections": [
              {
                "icon": "🔗",
                "label": "Similarities",
                "text": "It seems to me that in many aspects the two pictures are very much alike. They both show people travelling.",
                "phrases": {
                  "discourse": ["It seems to me", "in many aspects"],
                  "vocabulary": ["very much alike", "travelling"]
                }
              },
              {
                "icon": "⚡",
                "label": "Difference",
                "text": "The first picture shows a woman commuting to work by train. By contrast, the second shows a woman cycling to work.",
                "phrases": {
                  "discourse": ["By contrast"],
                  "vocabulary": ["commuting", "cycling"]
                }
              }
            ]
          }
        }
      }
    ]
  },

  "justifying": {
    "task": "Which method of transport do you think is better for commuting? Why?",
    "phraseBank": {
      "discourse": [
        "In my opinion",
        "I believe that",
        "From my perspective",
        "It seems to me that",
        "I would argue that",
        "The main reason is that",
        "This is because",
        "What's more",
        "Furthermore",
        "Additionally",
        "For instance",
        "For example",
        "That's why"
      ],
      "vocabulary": [
        "eco-friendly",
        "sustainable",
        "environmentally conscious",
        "carbon footprint",
        "health benefits",
        "physical exercise",
        "cost-effective",
        "convenient",
        "reliable",
        "efficient",
        "flexible",
        "stress-free"
      ]
    },
    "pairs": [
      {
        "image1": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
        "image2": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        "responses": {
          "default": {
            "sections": [
              {
                "icon": "💡",
                "label": "Opinion",
                "text": "In my opinion, cycling is better for commuting if you live close to work.",
                "phrases": {
                  "discourse": ["In my opinion"],
                  "vocabulary": ["cycling", "commuting"]
                }
              },
              {
                "icon": "✓",
                "label": "Justification",
                "text": "The main reason is that it's more eco-friendly and provides excellent health benefits. What's more, it's cost-effective compared to public transport.",
                "phrases": {
                  "discourse": ["The main reason is that", "What's more"],
                  "vocabulary": ["eco-friendly", "health benefits", "cost-effective"]
                }
              },
              {
                "icon": "📌",
                "label": "Example",
                "text": "For instance, cycling to work helps you stay fit while reducing your carbon footprint. That's why I think it's the better option for short distances.",
                "phrases": {
                  "discourse": ["For instance", "That's why"],
                  "vocabulary": ["stay fit", "carbon footprint"]
                }
              }
            ]
          },
          "alternative1": {
            "sections": [
              {
                "icon": "💡",
                "label": "Opinion",
                "text": "I believe that cycling is superior for commuting when the distance is manageable.",
                "phrases": {
                  "discourse": ["I believe that"],
                  "vocabulary": ["cycling", "superior", "commuting"]
                }
              },
              {
                "icon": "✓",
                "label": "Justification",
                "text": "This is because it combines physical exercise with environmentally conscious transport. Furthermore, it's more flexible than relying on public transport schedules.",
                "phrases": {
                  "discourse": ["This is because", "Furthermore"],
                  "vocabulary": ["physical exercise", "environmentally conscious", "flexible"]
                }
              },
              {
                "icon": "📌",
                "label": "Example",
                "text": "For example, you can avoid rush hour delays while getting your daily workout. That's why I'd recommend it for anyone living within cycling distance.",
                "phrases": {
                  "discourse": ["For example", "That's why"],
                  "vocabulary": ["rush hour", "daily workout"]
                }
              }
            ]
          },
          "alternative2": {
            "sections": [
              {
                "icon": "💡",
                "label": "Opinion",
                "text": "From my perspective, cycling represents the better choice for local commuting.",
                "phrases": {
                  "discourse": ["From my perspective"],
                  "vocabulary": ["cycling", "local commuting"]
                }
              },
              {
                "icon": "✓",
                "label": "Justification",
                "text": "I would argue that its sustainability and health advantages outweigh other options. Additionally, it offers a stress-free start to the working day.",
                "phrases": {
                  "discourse": ["I would argue that", "Additionally"],
                  "vocabulary": ["sustainability", "health advantages", "stress-free"]
                }
              },
              {
                "icon": "📌",
                "label": "Example",
                "text": "It seems to me that the combination of saving money and staying healthy makes cycling ideal. That's why more people are choosing bikes over cars.",
                "phrases": {
                  "discourse": ["It seems to me that", "That's why"],
                  "vocabulary": ["saving money", "staying healthy"]
                }
              }
            ]
          }
        }
      }
    ]
  },

  "speculating": {
    "task": "What might these people be thinking about during their journey?",
    "phraseBank": {
      "discourse": [
        "I imagine that",
        "I would guess that",
        "It's possible that",
        "Perhaps",
        "Maybe",
        "They might be",
        "They could be",
        "It's likely that",
        "Probably",
        "I suspect that",
        "I'd say that",
        "It seems probable that"
      ],
      "vocabulary": [
        "reflecting on",
        "contemplating",
        "thinking about",
        "planning ahead",
        "worrying about",
        "looking forward to",
        "daydreaming",
        "mentally preparing",
        "reviewing",
        "anticipating",
        "considering",
        "pondering"
      ]
    },
    "pairs": [
      {
        "image1": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
        "image2": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        "responses": {
          "default": {
            "sections": [
              {
                "icon": "💭",
                "label": "First Speculation",
                "text": "I imagine that the woman on the train might be thinking about her upcoming meetings or planning ahead for the day.",
                "phrases": {
                  "discourse": ["I imagine that", "might be"],
                  "vocabulary": ["thinking about", "planning ahead"]
                }
              },
              {
                "icon": "💭",
                "label": "Second Speculation",
                "text": "Perhaps the cyclist is enjoying the fresh air and mentally preparing for work. It's possible that she's also feeling good about making an eco-friendly choice.",
                "phrases": {
                  "discourse": ["Perhaps", "It's possible that"],
                  "vocabulary": ["mentally preparing", "eco-friendly choice"]
                }
              }
            ]
          },
          "alternative1": {
            "sections": [
              {
                "icon": "💭",
                "label": "First Speculation",
                "text": "I would guess that the commuter on the train could be reviewing her schedule or worrying about being late.",
                "phrases": {
                  "discourse": ["I would guess that", "could be"],
                  "vocabulary": ["reviewing", "worrying about"]
                }
              },
              {
                "icon": "💭",
                "label": "Second Speculation",
                "text": "It's likely that the cyclist is contemplating her day while enjoying the physical activity. I suspect that she's looking forward to arriving at work feeling energized.",
                "phrases": {
                  "discourse": ["It's likely that", "I suspect that"],
                  "vocabulary": ["contemplating", "looking forward to", "energized"]
                }
              }
            ]
          },
          "alternative2": {
            "sections": [
              {
                "icon": "💭",
                "label": "First Speculation",
                "text": "I'd say that the train passenger is probably pondering work challenges or anticipating the day ahead.",
                "phrases": {
                  "discourse": ["I'd say that", "probably"],
                  "vocabulary": ["pondering", "anticipating"]
                }
              },
              {
                "icon": "💭",
                "label": "Second Speculation",
                "text": "It seems probable that the cyclist is reflecting on the health benefits of her journey. Maybe she's also daydreaming while enjoying the scenery.",
                "phrases": {
                  "discourse": ["It seems probable that", "Maybe"],
                  "vocabulary": ["reflecting on", "health benefits", "daydreaming"]
                }
              }
            ]
          }
        }
      }
    ]
  }
};

console.log('✓ part2-structure.js loaded successfully');
console.log('Available categories:', Object.keys(SPEAKING_DATA));
