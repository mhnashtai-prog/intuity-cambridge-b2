{
  "advantages": {
    "label": "Advantages",
    "category": "discursive",
    "when": "to point out a benefit or strength",
    "origin": ["functional-english"],
    "phrases": [
      { "t": "A major advantage of …", "connector": "is that it allows people to …, which means …", "register": null },
      { "t": "One of the primary strengths of …", "connector": "is that it tends to …, so …", "register": null },
      { "t": "A significant feature of …", "connector": "is how it enables …, and this leads to …", "register": null },
      { "t": "One of the key qualities of …", "connector": "is its ability to …, which is why …", "register": null },
      { "t": "The greatest value of …", "connector": "lies in the fact that it …, particularly when …", "register": null },
      { "t": "A notable upside of …", "connector": "is that it makes …, especially for …", "register": null },
      { "t": "One of the standout advantages of …", "connector": "is how it supports …, meaning that …", "register": null },
      { "t": "A core strength of …", "connector": "is that it provides …, which helps …", "register": null },
      { "t": "What makes … appealing is …", "connector": "the way it …, which ultimately …", "register": null },
      { "t": "By far the most appealing aspect of … is …", "connector": "how it …, because this means …", "register": null }
    ],
    "tasks": [
      {
        "topic": "living city",
        "question": "What are the advantages of living in a big city?",
        "cues": [
          { "cue": "big cities / offer / more job opportunities", "trigger": "advantage",
            "models": ["A major advantage of big cities is that they allow people to access more job opportunities, which means better career prospects."] },
          { "cue": "big cities / provide / diverse entertainment", "trigger": "strength",
            "models": ["One of the primary strengths of big cities is that they tend to provide diverse entertainment, so residents rarely get bored."] },
          { "cue": "big cities / connect / people through better transport", "trigger": "feature",
            "models": ["A significant feature of big cities is how they enable better transport connections, and this leads to easier commuting."] },
          { "cue": "big cities / give access to / top universities", "trigger": "quality",
            "models": ["One of the key qualities of big cities is their ability to give access to top universities, which is why so many students move there."] },
          { "cue": "big cities / bring together / diverse cultures", "trigger": "value",
            "models": ["The greatest value of big cities lies in the fact that they bring together diverse cultures, particularly when people work in international companies."] },
          { "cue": "big cities / make / networking easier", "trigger": "upside",
            "models": ["A notable upside of big cities is that they make networking easier, especially for young professionals."] }
        ]
      },
      {
        "topic": "learning language",
        "question": "What are the benefits of learning a foreign language?",
        "cues": [
          { "cue": "learning a language / open / doors", "trigger": "upside",
            "models": ["A notable upside of learning a language is that it opens doors, especially for those seeking international careers."] },
          { "cue": "learning a language / allow / access to new cultures", "trigger": "advantage",
            "models": ["A major advantage of learning a language is that it allows people to access new cultures, which means richer travel experiences."] },
          { "cue": "learning a language / improve / memory", "trigger": "strength",
            "models": ["One of the primary strengths of learning a language is that it tends to improve memory, so learners benefit cognitively."] },
          { "cue": "learning a language / boost / job prospects", "trigger": "feature",
            "models": ["A significant feature of learning a language is how it enables better job prospects, and this leads to higher salaries."] },
          { "cue": "learning a language / build / confidence", "trigger": "quality",
            "models": ["One of the key qualities of learning a language is its ability to build confidence, which is why many learners feel more independent abroad."] },
          { "cue": "learning a language / provide / a competitive edge", "trigger": "core strength",
            "models": ["A core strength of learning a language is that it provides a competitive edge, which helps in the job market."] }
        ]
      },
      {
        "topic": "online learning",
        "question": "What are the advantages of studying online rather than in a classroom?",
        "cues": [
          { "cue": "online learning / let / study anywhere", "trigger": "strength",
            "models": ["One of the primary strengths of online learning is that it tends to let you study anywhere, so you can fit lessons around your life."] },
          { "cue": "online learning / allow / flexible scheduling", "trigger": "advantage",
            "models": ["A major advantage of online learning is that it allows people to arrange a flexible schedule, which means fewer conflicts with work."] },
          { "cue": "online learning / enable / access to global courses", "trigger": "feature",
            "models": ["A significant feature of online learning is how it enables access to global courses, and this leads to a wider choice of subjects."] },
          { "cue": "online learning / reduce / travel costs", "trigger": "value",
            "models": ["The greatest value of online learning lies in the fact that it reduces travel costs, particularly when students live far from campus."] },
          { "cue": "online learning / make / repeating lessons easy", "trigger": "upside",
            "models": ["A notable upside of online learning is that it makes repeating lessons easy, especially for difficult topics."] },
          { "cue": "online learning / support / self-paced study", "trigger": "standout advantage",
            "models": ["One of the standout advantages of online learning is how it supports self-paced study, meaning that students can learn at their own speed."] }
        ]
      },
      {
        "topic": "working home",
        "question": "What are the good points about working from home?",
        "cues": [
          { "cue": "working from home / save / commuting time", "trigger": "feature",
            "models": ["A significant feature of working from home is how it saves commuting time, and this leads to more time for family."] },
          { "cue": "working from home / allow / a flexible schedule", "trigger": "advantage",
            "models": ["A major advantage of working from home is that it allows people to keep a flexible schedule, which means better time management."] },
          { "cue": "working from home / increase / productivity", "trigger": "strength",
            "models": ["One of the primary strengths of working from home is that it tends to increase productivity, so employees get more done."] },
          { "cue": "working from home / give / more independence", "trigger": "quality",
            "models": ["One of the key qualities of working from home is its ability to give more independence, which is why many employees prefer it."] },
          { "cue": "working from home / provide / a comfortable environment", "trigger": "core strength",
            "models": ["A core strength of working from home is that it provides a comfortable environment, which helps concentration."] },
          { "cue": "working from home / make / childcare easier", "trigger": "upside",
            "models": ["A notable upside of working from home is that it makes childcare easier, especially for parents of young children."] }
        ]
      },
      {
        "topic": "transport public",
        "question": "What are the advantages of using public transport?",
        "cues": [
          { "cue": "public transport / reduce / traffic", "trigger": "value",
            "models": ["The greatest value of public transport lies in the fact that it reduces traffic, particularly during rush hour."] },
          { "cue": "public transport / allow / commuters to relax", "trigger": "advantage",
            "models": ["A major advantage of public transport is that it allows commuters to relax, which means less stress during the journey."] },
          { "cue": "public transport / lower / travel costs", "trigger": "strength",
            "models": ["One of the primary strengths of public transport is that it tends to lower travel costs, so people save money."] },
          { "cue": "public transport / cut / carbon emissions", "trigger": "feature",
            "models": ["A significant feature of public transport is how it enables cutting carbon emissions, and this leads to cleaner air."] },
          { "cue": "public transport / make / city travel simpler", "trigger": "upside",
            "models": ["A notable upside of public transport is that it makes city travel simpler, especially for those without cars."] },
          { "cue": "public transport / support / less congested roads", "trigger": "standout advantage",
            "models": ["One of the standout advantages of public transport is how it supports less congested roads, meaning that journeys become faster for everyone."] }
        ]
      },
      {
        "topic": "exercise regular",
        "question": "What are the benefits of doing regular exercise?",
        "cues": [
          { "cue": "regular exercise / improve / health", "trigger": "core strength",
            "models": ["A core strength of regular exercise is that it provides improved health, which helps daily energy levels."] },
          { "cue": "regular exercise / allow / better sleep", "trigger": "advantage",
            "models": ["A major advantage of regular exercise is that it allows people to sleep better, which means improved concentration."] },
          { "cue": "regular exercise / boost / mood", "trigger": "strength",
            "models": ["One of the primary strengths of regular exercise is that it tends to boost mood, so people feel happier overall."] },
          { "cue": "regular exercise / strengthen / the immune system", "trigger": "feature",
            "models": ["A significant feature of regular exercise is how it enables a stronger immune system, and this leads to fewer illnesses."] },
          { "cue": "regular exercise / build / physical strength", "trigger": "quality",
            "models": ["One of the key qualities of regular exercise is its ability to build physical strength, which is why athletes train consistently."] },
          { "cue": "regular exercise / make / stress easier to manage", "trigger": "upside",
            "models": ["A notable upside of regular exercise is that it makes stress easier to manage, especially during busy periods."] }
        ]
      }
    ]
  }
}
