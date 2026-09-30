import generateResponse from "../config/openRouter.js"
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extract from "../utils/extract.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/
- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using JavaScript
- No page reloads
- No dead UI
- No broken buttons
- Use SINGLE quotes for all HTML attribute values (e.g. href='#home', class='nav-link'), never double quotes with backslash escaping.

--------------------------------------------------
SPA VISIBILITY RULE (MANDATORY)
--------------------------------------------------
- Pages MUST NOT be hidden permanently
- If .page { display: none } is used,
  then .page.active { display: block } is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID
`;


const GENERATE_CREDIT_COST  = 50;

export const generateWebsite = async (req, res) => {
    let creditsDeducted = false;
    let userId = null;

    try {
        const { prompt } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        userId = req.user._id;

        // Atomically check and deduct credits up front
        const user = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: GENERATE_CREDIT_COST  } },
            { $inc: { credits: -GENERATE_CREDIT_COST  } },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ message: "You don't have enough credits." });
        }
        creditsDeducted = true;

        const finalPrompt = masterPrompt.replace("{USER_PROMPT}", () => prompt);

        // First attempt
        let result = await generateResponse(finalPrompt);
        let parsed = extract(result.content);

        // One retry, only if the first attempt failed
        if (!parsed) {
            console.log("First response failed. finishReason:", result.finishReason);

            const retryPrompt =
                result.finishReason === "length"
                    ? finalPrompt +
                      "\n\nYour previous answer was cut off. Produce a MORE COMPACT site (under 400 lines total, minimal CSS) and finish with </code>."
                    : finalPrompt;

            result = await generateResponse(retryPrompt);
            parsed = extract(result.content);
        }

        if (!parsed || !parsed.code) {
            console.log("AI returned invalid response. finishReason:", result.finishReason);
            console.log(result.content?.slice(-500));

            // Refund credits since nothing was delivered
            await User.updateOne({ _id: userId }, { $inc: { credits: GENERATE_CREDIT_COST  } });
            creditsDeducted = false;

            return res.status(400).json({ message: "AI returned invalid response. Please try again." });
        }

        const website = await Website.create({
            user: userId,
            title: prompt.slice(0, 60),
            latestCode: parsed.code,
            conversation: [
                { role: "user", content: prompt },
                { role: "ai", content: parsed.message },
            ],
        });

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits,
        });
    } catch (error) {
        console.log("Generate website error:", error);

        // Refund if we charged but failed before finishing
        if (creditsDeducted && userId) {
            try {
                await User.updateOne({ _id: userId }, { $inc: { credits: GENERATE_CREDIT_COST  } });
            } catch (refundError) {
                console.log("Refund failed:", refundError);
            }
        }

        return res.status(500).json({ message: "Failed to generate website" });
    }
};

export const getWebsiteById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!website) {
            return res.status(404).json({ message: "Website not found" });
        }

        return res.status(200).json(website);
    } catch (error) {
        console.log("Get website error:", error);
        return res.status(500).json({ message: "Failed to load website" });
    }
};


const CREDIT_COST = 25;

export const changes = async (req, res) => {
    let creditsDeducted = false;
    let userId = null;

    try {
        const { prompt } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        userId = req.user._id;

        // Look up the website BEFORE charging credits
        const website = await Website.findOne({
            _id: req.params.id,
            user: userId,
        });

        if (!website) {
            return res.status(404).json({ message: "Website not found" });
        }

        // Now safe to deduct credits atomically
        const user = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: CREDIT_COST } },
            { $inc: { credits: -CREDIT_COST } },
            { returnDocument: "after" }
        );

        if (!user) {
            return res.status(400).json({ message: "You don't have enough credits." });
        }
        creditsDeducted = true;

        const updatePrompt = `
You are updating an existing website. Modify ONLY what the user asks for
and keep everything else the same.

CURRENT HTML:
${website.latestCode}

USER REQUEST:
${prompt}

OUTPUT FORMAT (MANDATORY)
<message>One short confirmation sentence</message>
<code>
<!DOCTYPE html>
...the COMPLETE updated HTML document, unescaped, real line breaks,
single quotes for all attributes...
</code>
Output nothing outside these two tags.
`;

        let result = await generateResponse(updatePrompt);
        let parsed = extract(result.content);

        if (!parsed) {
            console.log("First update attempt failed. finishReason:", result.finishReason);

            const retryPrompt =
                result.finishReason === "length"
                    ? updatePrompt +
                      "\n\nYour previous answer was cut off. Keep the response compact and finish with </code>."
                    : updatePrompt;

            result = await generateResponse(retryPrompt);
            parsed = extract(result.content);
        }

        if (!parsed || !parsed.code) {
            console.log("AI returned invalid response on update. finishReason:", result.finishReason);
            console.log(result.content?.slice(-500));

            await User.updateOne({ _id: userId }, { $inc: { credits: CREDIT_COST } });
            creditsDeducted = false;

            return res.status(400).json({ message: "AI returned invalid response. Please try again." });
        }

        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message }
        );
        website.latestCode = parsed.code;

        await website.save();

        return res.status(200).json({
            message: parsed.message,
            code: parsed.code,
            remainingCredits: user.credits,
        });
    } catch (error) {
        console.log("Update website error:", error);

        if (creditsDeducted && userId) {
            try {
                await User.updateOne({ _id: userId }, { $inc: { credits: CREDIT_COST } });
            } catch (refundError) {
                console.log("Refund failed:", refundError);
            }
        }

        return res.status(500).json({ message: "Failed to update website" });
    }
};

export const getAll = async (req,res) => {
    try {
        const websites = await Website.find({user:req.user._id})
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(400).json({message:`All websites error ${error}`})
    }
    
}

export const deploy = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!website) {
            return res.status(404).json({
                message: "Website not found",
            });
        }

        if (!website.slug) {
            website.slug =
                website.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                + "-"
                + website._id.toString().slice(-5);
        }

        website.deployed = true;
        website.deployUrl = `${process.env.CLIENT_URL}/site/${website.slug}`;

        await website.save();

        return res.status(200).json({
            url: website.deployUrl,
        });

    } catch (error) {
        console.log("Deploy error:", error);

        return res.status(400).json({
            message: `Deploy error ${error.message}`,
        });
    }
};

export const getBySlug = async (req, res) => {
    try {
        const website = await Website.findOne({
            slug: req.params.slug,
            deployed: true,
        });

        if (!website) {
            return res.status(404).json({
                message: "Website not found",
            });
        }

        return res.status(200).json(website);

    } catch (error) {
        console.log("Slug error:", error);

        return res.status(500).json({
            message: `Slug error ${error.message}`,
        });
    }
};

