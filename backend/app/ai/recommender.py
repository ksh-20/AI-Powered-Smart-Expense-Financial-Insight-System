from typing import List, Dict, Any

ESSENTIAL_CATEGORIES = {
    "Groceries",
    "Utilities",
    "Healthcare",
    "Education",
    "Rent",
    "Insurance",
    "Transport",
}

DISCRETIONARY_CATEGORIES = {
    "Shopping",
    "Food & Dining",
    "Entertainment",
    "Travel",
    "Leisure",
    "Personal Care",
    "Other",
}


def generate_detailed_insights(
    total: float,
    categories: Dict[str, float],
    expenses: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generates in-depth, structured financial insights with multi-paragraph explanations,
    actionable steps, benchmark comparisons, and potential savings calculations.
    Works for any dataset size, including single-item expenses.
    """
    if expenses is None:
        expenses = []

    count = len(expenses) if expenses else (sum(1 for _ in categories) if categories else 0)
    insights = []

    # ── 0. Handle Zero Expenses Case ─────────────────────────────────────────
    if total <= 0 or not categories:
        return {
            "insights": [
                {
                    "id": "welcome_starter",
                    "type": "strategy",
                    "tag": "Getting Started",
                    "title": "Welcome to Smart Financial Insights",
                    "impact_level": "High",
                    "potential_savings": 0.0,
                    "summary": "Begin tracking your expenses to unlock personalized algorithmic insights and budget optimization strategies.",
                    "detailed_explanation": (
                        "Our financial intelligence engine continuously analyzes your spending velocity, category distributions, "
                        "and transaction behaviors. Once you record your first expense or import a statement, you will receive "
                        "actionable diagnostics on discretionary trimming, 50/30/20 rule alignment, and savings projections."
                    ),
                    "actionable_steps": [
                        "Add your first daily transaction or upload a recent bank statement in the Expenses tab.",
                        "Set up a monthly expenditure target in the Budget Goals section.",
                        "Categorize recurring bills like utilities, rent, and subscriptions for baseline tracking."
                    ],
                    "benchmark_comparison": "Regular expense tracking has been shown to reduce impulse purchases by up to 22% within the first 60 days.",
                }
            ],
            "essential_total": 0.0,
            "discretionary_total": 0.0,
            "essential_pct": 0.0,
            "discretionary_pct": 0.0,
            "potential_monthly_savings": 0.0,
            "health_score": 100,
        }

    # Calculate essential vs discretionary breakdown
    essential_total = 0.0
    discretionary_total = 0.0
    for cat, amt in categories.items():
        if cat in ESSENTIAL_CATEGORIES:
            essential_total += amt
        else:
            discretionary_total += amt

    essential_pct = round((essential_total / total) * 100, 1) if total > 0 else 0.0
    discretionary_pct = round((discretionary_total / total) * 100, 1) if total > 0 else 0.0

    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    top_cat_name, top_cat_amt = sorted_cats[0]
    top_cat_pct = round((top_cat_amt / total) * 100, 1) if total > 0 else 0.0

    # ── CASE 1: Exactly 1 Expense Present ─────────────────────────────────────
    if count == 1 or len(sorted_cats) == 1 and count <= 2:
        exp = expenses[0] if expenses else {"amount": top_cat_amt, "category": top_cat_name, "description": "Recorded expense"}
        amt = exp.get("amount", top_cat_amt)
        cat = exp.get("category", top_cat_name)
        desc = exp.get("description", "Recorded expense")

        # Insight 1: Initial Anchor Diagnostic
        insights.append({
            "id": "single_baseline_diagnostic",
            "type": "opportunity",
            "tag": "Baseline Analysis",
            "title": f"Initial Expense Anchor in {cat} (₹{amt:,.2f})",
            "impact_level": "High",
            "potential_savings": round(amt * 0.15, 2),
            "summary": f"Your first recorded transaction of ₹{amt:,.2f} at '{desc}' represents 100% of your current financial outflow.",
            "detailed_explanation": (
                f"You have begun your financial intelligence journey with an initial expenditure in {cat}. "
                f"Because this is your primary tracked data point, establishing early discipline in this category will "
                f"set the tone for your overall monthly burn rate. Identifying whether '{desc}' is a routine recurring "
                f"expense or an occasional one-off purchase allows our algorithms to project your financial runway accurately."
            ),
            "actionable_steps": [
                f"Log at least 3-5 additional routine transactions to build a comprehensive category baseline.",
                f"Define a monthly budget ceiling for {cat} in the Budget Goals tab to prevent unexpected overruns.",
                f"If this is a recurring monthly bill, set a calendar reminder to review rate changes or subscription tiers."
            ],
            "benchmark_comparison": "Tracking the first 5 transactions increases monthly savings adherence by over 35%.",
        })

        # Insight 2: Category-Specific Optimization Advisory
        cat_advice = get_category_specific_advisory(cat, amt)
        insights.append({
            "id": f"single_cat_advisory_{cat.lower().replace(' ', '_')}",
            "type": "strategy",
            "tag": f"{cat} Strategy",
            "title": f"Strategic Financial Advisory for {cat}",
            "impact_level": "Medium",
            "potential_savings": round(amt * 0.10, 2),
            "summary": cat_advice["summary"],
            "detailed_explanation": cat_advice["explanation"],
            "actionable_steps": cat_advice["steps"],
            "benchmark_comparison": cat_advice["benchmark"],
        })

        # Insight 3: The 50/30/20 Rule Roadmap
        insights.append({
            "id": "single_50_30_20_framework",
            "type": "tip",
            "tag": "Financial Blueprint",
            "title": "Adopting the 50/30/20 Wealth Allocation Blueprint",
            "impact_level": "High",
            "potential_savings": round(amt * 0.20, 2),
            "summary": "Structure your ongoing expenses around 50% Needs, 30% Wants, and 20% Savings.",
            "detailed_explanation": (
                "The 50/30/20 rule is a time-tested financial architecture designed to build wealth while maintaining lifestyle balance. "
                f"Your current transaction in {cat} falls under the '{'Needs' if cat in ESSENTIAL_CATEGORIES else 'Wants'}' pillar. "
                "As you record additional expenses, our system will calculate your real-time pillar split to ensure you remain "
                "on track to save at least 20% of your earnings every month."
            ),
            "actionable_steps": [
                "Classify upcoming expenses into Essential Needs vs. Discretionary Wants.",
                "Automate a fixed transfer of 20% of monthly income directly into a high-yield savings or mutual fund account.",
                "Review discretionary spending weekly to ensure lifestyle creep does not erode your savings margin."
            ],
            "benchmark_comparison": "Individuals following the 50/30/20 rule accumulate an emergency fund 2.4x faster than unstructured spenders.",
        })

        potential_savings = round(amt * 0.15, 2)
        health_score = 88

        return {
            "insights": insights,
            "recommendations": [i["summary"] for i in insights],
            "essential_total": essential_total,
            "discretionary_total": discretionary_total,
            "essential_pct": essential_pct,
            "discretionary_pct": discretionary_pct,
            "potential_monthly_savings": potential_savings,
            "health_score": health_score,
        }

    # ── CASE 2: Multiple Expenses Present (2 or more) ─────────────────────────
    total_potential_savings = 0.0

    # Insight 1: Heavy Concentration & Pareto Driver
    if top_cat_pct >= 35:
        savings_calc = round(top_cat_amt * 0.15, 2)
        total_potential_savings += savings_calc
        insights.append({
            "id": "concentration_driver",
            "type": "warning" if top_cat_pct >= 50 else "opportunity",
            "tag": "Concentration Risk",
            "title": f"Dominant Outflow: {top_cat_name} ({top_cat_pct}% of Total Spending)",
            "impact_level": "High",
            "potential_savings": savings_calc,
            "summary": f"{top_cat_name} accounts for ₹{top_cat_amt:,.2f} ({top_cat_pct}% of all outflows), making it your primary expenditure driver.",
            "detailed_explanation": (
                f"When a single category claims over {top_cat_pct}% of your overall financial outflow, any cost volatility or unchecked "
                f"spending here directly impacts your ability to save. By applying a focused 15% optimization strategy to {top_cat_name}, "
                f"you could unlock approximately ₹{savings_calc:,.2f} in freed cash flow each month without sacrificing quality of life."
            ),
            "actionable_steps": [
                f"Audit the largest individual transactions in {top_cat_name} to spot one-time splurges vs. recurring leaks.",
                f"Set a strict monthly limit for {top_cat_name} in the Budget Goals section to get automated threshold warnings.",
                f"Institute a 48-hour cooling period for any non-essential purchase in this category above ₹1,000."
            ],
            "benchmark_comparison": f"Balanced financial profiles maintain their top non-housing category under 25-30% of total outflow.",
        })
    else:
        insights.append({
            "id": "balanced_outflows",
            "type": "achievement",
            "tag": "Portfolio Balance",
            "title": "Healthy Expenditure Diversification",
            "impact_level": "Medium",
            "potential_savings": round(total * 0.08, 2),
            "summary": f"Your spending is well-diversified across {len(categories)} categories, with {top_cat_name} leading at a healthy {top_cat_pct}%.",
            "detailed_explanation": (
                "Your expense distribution avoids excessive concentration risk. Diversified outflows mean that unexpected "
                "spikes in any single area will not derail your broader financial stability. Continuing this balanced approach "
                "ensures predictable cash flow and steady monthly savings accumulation."
            ),
            "actionable_steps": [
                "Maintain your current balanced spending habits across routine categories.",
                "Review category totals at the end of each month to catch gradual cost creep early.",
                "Direct any surplus cash from under-budget categories straight into emergency savings."
            ],
            "benchmark_comparison": "Diversified spending reduces monthly budget variance by 40% compared to concentrated profiles.",
        })

    # Insight 2: Essential Needs vs. Discretionary Wants Analysis
    if discretionary_pct >= 45:
        savings_disc = round(discretionary_total * 0.18, 2)
        total_potential_savings += savings_disc
        insights.append({
            "id": "wants_optimization",
            "type": "opportunity",
            "tag": "Lifestyle Ratio",
            "title": f"Elevated Lifestyle & Discretionary Outflows ({discretionary_pct}%)",
            "impact_level": "High",
            "potential_savings": savings_disc,
            "summary": f"Discretionary spending totals ₹{discretionary_total:,.2f} ({discretionary_pct}% of budget) vs ₹{essential_total:,.2f} in essentials.",
            "detailed_explanation": (
                f"Your non-essential lifestyle outflows (Shopping, Dining, Entertainment, Leisure) represent {discretionary_pct}% of total spending. "
                f"While leisure and comfort are important, the standard 50/30/20 guideline recommends capping discretionary wants at 30%. "
                f"Realigning your discretionary spending closer to recommended benchmarks could yield up to ₹{savings_disc:,.2f} in monthly capital retention."
            ),
            "actionable_steps": [
                "Identify high-frequency discretionary habits (e.g. daily food delivery, impulse online orders) and substitute with cost-effective alternatives.",
                "Adopt a 'cash-envelope' or dedicated debit card allowance for monthly leisure spending.",
                "Cancel unused subscriptions and streaming services that have not been used in the past 30 days."
            ],
            "benchmark_comparison": "The 50/30/20 framework suggests keeping Discretionary Wants under 30% to guarantee long-term wealth building.",
        })
    else:
        insights.append({
            "id": "frugal_discipline",
            "type": "achievement",
            "tag": "Frugal Discipline",
            "title": f"Strong Essential Spending Discipline ({essential_pct}% Needs)",
            "impact_level": "Medium",
            "potential_savings": round(discretionary_total * 0.10, 2),
            "summary": f"A dominant {essential_pct}% of your spending is directed toward core essentials (Groceries, Utilities, Healthcare).",
            "detailed_explanation": (
                f"Your financial profile demonstrates excellent discipline, directing ₹{essential_total:,.2f} into core living requirements "
                f"while restricting discretionary wants to {discretionary_pct}%. This frugal foundation creates a strong protective barrier "
                f"against inflation and living cost spikes."
            ),
            "actionable_steps": [
                "Consider bulk-purchasing essential staples to negotiate better unit prices on recurring groceries.",
                "Ensure utility bills are automated on cash-back credit cards to earn 2-5% rebates on mandatory spending.",
                "Channel the excess cash from your low discretionary burn into long-term compounding investments."
            ],
            "benchmark_comparison": "Keeping wants under 30% places you in the top 20% of disciplined budgeters.",
        })

    # Insight 3: Category Deep-Dive for the Top Category
    cat_advice = get_category_specific_advisory(top_cat_name, top_cat_amt)
    insights.append({
        "id": f"top_cat_deep_dive_{top_cat_name.lower().replace(' ', '_')}",
        "type": "strategy",
        "tag": f"{top_cat_name} Deep-Dive",
        "title": f"Actionable Cost Reduction Strategy for {top_cat_name}",
        "impact_level": "Medium",
        "potential_savings": round(top_cat_amt * 0.12, 2),
        "summary": cat_advice["summary"],
        "detailed_explanation": cat_advice["explanation"],
        "actionable_steps": cat_advice["steps"],
        "benchmark_comparison": cat_advice["benchmark"],
    })

    # Insight 4: Annual Compounding Potential
    annual_savings = round(total_potential_savings * 12, 2)
    insights.append({
        "id": "compound_wealth_potential",
        "type": "tip",
        "tag": "Wealth Multiplier",
        "title": f"Annual Compounding Potential: ₹{annual_savings:,.2f}/year",
        "impact_level": "High",
        "potential_savings": total_potential_savings,
        "summary": f"Implementing the recommended trims could compound into ₹{annual_savings:,.2f} in annual savings.",
        "detailed_explanation": (
            f"Small daily and weekly spending optimizations generate substantial long-term wealth when compounded. "
            f"Redirecting ₹{total_potential_savings:,.2f} per month into an index fund or systematic investment plan (SIP) earning an "
            f"estimated 12% annualized return would grow to over ₹10.5 Lakhs in 5 years and ₹32 Lakhs in 10 years."
        ),
        "actionable_steps": [
            "Set up an automated monthly SIP or recurring deposit on the day after your income arrives.",
            "Treat savings as a non-negotiable expense ('Pay Yourself First') rather than saving whatever is left over.",
            "Use the FinAI Assistant to model custom investment projections based on your saved capital."
        ],
        "benchmark_comparison": "Compounding ₹5,000/month at 12% generates ₹4.1 Lakhs in interest alone over 10 years.",
    })

    health_score = max(50, min(96, int(100 - (discretionary_pct * 0.4) - (max(0, top_cat_pct - 40) * 0.5))))

    return {
        "insights": insights,
        "recommendations": [i["summary"] for i in insights],
        "essential_total": round(essential_total, 2),
        "discretionary_total": round(discretionary_total, 2),
        "essential_pct": essential_pct,
        "discretionary_pct": discretionary_pct,
        "potential_monthly_savings": total_potential_savings,
        "health_score": health_score,
    }


def get_category_specific_advisory(category: str, amount: float) -> Dict[str, Any]:
    """Provides tailored category-level guidance."""
    cat = category.strip()
    if cat == "Food & Dining":
        return {
            "summary": f"Optimize Food & Dining (₹{amount:,.2f}) through planned meal prepping and dining limits.",
            "explanation": (
                "Food delivery charges, platform convenience fees, and frequent restaurant dining often carry a 250-300% markup "
                "over home-cooked meals. Preparing meals in advance during the workweek while reserving restaurant visits for "
                "special occasions drastically reduces expenditure without compromising enjoyment."
            ),
            "steps": [
                "Cap food delivery apps (Swiggy/Zomato) to a maximum of 1-2 designated days per week.",
                "Prep weekly lunches in advance to eliminate weekday takeout impulse purchases.",
                "Check for dining discount passes and card promotions before settling restaurant bills."
            ],
            "benchmark": "Average urban households spend 15-18% of their income on food; keeping dining out under 8% preserves substantial wealth."
        }
    elif cat == "Shopping":
        return {
            "summary": f"Control Shopping outflows (₹{amount:,.2f}) by enforcing an impulse cooling rule.",
            "explanation": (
                "E-commerce platforms utilize flash sales, limited-time deals, and personalized algorithms to induce impulse purchases. "
                "Creating an intentional shopping wishlist and waiting 48 hours before confirming non-essential checkouts eliminates "
                "over 60% of regretful discretionary spending."
            ),
            "steps": [
                "Use a mandatory 48-hour cooling-off rule for any online cart item over ₹1,000.",
                "Unsubscribe from promotional shopping newsletters and push notifications.",
                "Consolidate orders to take advantage of seasonal discounts and avoid multiple delivery fees."
            ],
            "benchmark": "Financial advisors recommend restricting discretionary lifestyle shopping to under 15% of net monthly income."
        }
    elif cat == "Transport":
        return {
            "summary": f"Streamline Transport costs (₹{amount:,.2f}) with route consolidation and pass subscriptions.",
            "explanation": (
                "Surge pricing on ride-hailing apps (Uber, Ola) during peak commute hours can inflate travel costs by 40-70%. "
                "Combining public transit passes (Metro, trains) for fixed daily commutes and reserving cabs for emergencies "
                "provides significant recurring savings."
            ),
            "steps": [
                "Purchase monthly metro or transit smart cards to secure a 10-20% fare rebate.",
                "Avoid ride-hailing surge hours by scheduling commutes 15 minutes earlier or later.",
                "Use fuel loyalty programs or credit cards that offer 4-5% fuel surcharge waivers."
            ],
            "benchmark": "Commuting costs should ideally remain under 8-10% of total monthly expenses."
        }
    elif cat == "Entertainment":
        return {
            "summary": f"Audit Entertainment subscriptions and streaming packages (₹{amount:,.2f}).",
            "explanation": (
                "Multiple active streaming services (OTT, music, gaming passes) often result in 'subscription creep' where services "
                "are billed monthly despite low usage. Auditing active recurring subscriptions on a quarterly basis prevents silent cash drains."
            ),
            "steps": [
                "Audit all recurring entertainment subscriptions and cancel services unused in the last 30 days.",
                "Consider annual family sharing plans which cut per-user costs by up to 50%.",
                "Rotate streaming platforms one at a time rather than paying for 4-5 concurrent subscriptions."
            ],
            "benchmark": "Digital entertainment subscriptions should ideally stay under 3-5% of total budget."
        }
    elif cat == "Utilities":
        return {
            "summary": f"Optimize utility bills and recurring household tariffs (₹{amount:,.2f}).",
            "explanation": (
                "Household utilities (electricity, broadband, mobile plans) represent fixed mandatory commitments. "
                "Periodic plan reviews to align broadband speeds with actual usage and adopting energy-efficient appliances "
                "yield permanent monthly reductions."
            ),
            "steps": [
                "Review mobile and broadband data plans to ensure you are not paying for unused bandwidth tiers.",
                "Automate utility bill payments via credit cards or apps that provide cashback rewards.",
                "Audit seasonal electricity spikes from climate control devices."
            ],
            "benchmark": "Standard household utilities typically average 6-9% of monthly expenses."
        }
    else:
        return {
            "summary": f"Implement baseline tracking and periodic audits for {category} (₹{amount:,.2f}).",
            "explanation": (
                f"Tracking expenditures in {category} ensures visibility over specialized outflows. "
                "Conducting quarterly reviews helps distinguish between mandatory costs and discretionary additions."
            ),
            "steps": [
                f"Establish a targeted monthly spending limit for {category} in Budget Goals.",
                "Compare quotes or vendor pricing annually to ensure competitive rates.",
                "Maintain digital receipts for potential tax deductions or warranty claims."
            ],
            "benchmark": f"Reviewing {category} spending quarterly keeps overall outflow variance within a tight 5% margin."
        }


def generate_recommendations(total, category_data):
    """
    Backwards-compatible string list generator.
    """
    res = generate_detailed_insights(total, category_data)
    return res.get("recommendations", [])